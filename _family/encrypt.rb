# Encrypts the family tree data for the /family/ page.
#
#   ruby _family/encrypt.rb [path/to/family.yml]
#
# Reads _family/family-private.yml by default, asks for the password and writes
# assets/family/family.enc. The browser decrypts it with the Web Crypto API
# (PBKDF2-SHA256 -> AES-256-GCM), so both sides must keep these parameters in sync.
# Set FAMILY_PASSWORD to skip the prompt.

require 'openssl'
require 'base64'
require 'json'
require 'yaml'
require 'date'
require 'io/console'

ROOT = File.expand_path('..', __dir__)
SOURCE = ARGV[0] || File.join(ROOT, '_family', 'family-private.yml')
TARGET = File.join(ROOT, 'assets', 'family', 'family.enc')
ITERATIONS = 600_000
# Attachments (e.g. article screenshots): originals in _family/attachments/ (gitignored),
# encrypted copies with meaningless names in assets/family/files/ (committed)
ATTACHMENTS_DIR = File.join(ROOT, '_family', 'attachments')
FILES_DIR = File.join(ROOT, 'assets', 'family', 'files')
IMAGE_TYPES = { '.jpg' => 'image/jpeg', '.jpeg' => 'image/jpeg', '.png' => 'image/png',
                '.webp' => 'image/webp', '.gif' => 'image/gif' }.freeze
LARGE_FILE = 2_000_000

abort "Missing #{SOURCE} - copy _family/family-sample.yml to start." unless File.exist?(SOURCE)

people = YAML.safe_load(File.read(SOURCE, encoding: 'utf-8'), permitted_classes: [Date])
abort 'Data file must be a list of people.' unless people.is_a?(Array)

ids = people.map { |p| p['id'].to_s }
dupes = ids.select { |id| ids.count(id) > 1 }.uniq
abort "Duplicate ids: #{dupes.join(', ')}" if dupes.any?

# Dates can be a year (1952), year and month (1952-03) or a full date (1952-03-14),
# optionally approximate ("ok. 1890", "przed 1900-05", "po 1945"), or "?" when unknown
APPROXIMATE = /\A(ok\.|przed|po)\s+(.+)\z/

def parse_date(value, where)
  case value
  when Integer then [value]
  when Date then [value.year, value.month, value.day]
  when /\A(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?\z/ then [$1.to_i, $2&.to_i, $3&.to_i].compact
  else abort "#{where}: date '#{value}' must be YYYY, YYYY-MM or YYYY-MM-DD, " \
             "optionally starting with 'ok.', 'przed' or 'po', or \"?\""
  end
end

# 14.03.1952, 03.1952, 1952, ok. 1890 or ?
def format_date(value, where)
  return '?' if value == '?'
  prefix, value = $1, $2 if value.is_a?(String) && value =~ APPROXIMATE
  year, month, day = parse_date(value, where)
  date = [day && format('%02d', day), month && format('%02d', month), year].compact.join('.')
  [prefix, date].compact.join(' ')
end

nodes = people.to_h do |p|
  id = p['id'].to_s
  abort "#{id}: gender must be M or F" unless %w[M F].include?(p['gender'])
  data = { 'name' => p['name'].to_s, 'gender' => p['gender'], 'married' => {} }
  data['born'] = format_date(p['born'], "#{id} born") if p['born']
  data['died'] = format_date(p['died'], "#{id} died") if p['died']
  # Optional details shown in the panel when a card is tapped
  %w[maiden_name birthplace deathplace buried occupation notes].each do |field|
    data[field] = p[field].to_s.strip if p[field]
  end
  data['lived'] = Array(p['lived']).map(&:to_s) if p['lived']
  # Shown under the notes: - { file: jozef-artykul.png, caption: "Artykuł o Józefie" }
  data['attachments'] = Array(p['attachments']).map do |a|
    file = (a.is_a?(Hash) ? a['file'] : a).to_s
    path = File.join(ATTACHMENTS_DIR, file)
    abort "#{id}: attachment '#{file}' not found in _family/attachments/" unless File.file?(path)
    type = IMAGE_TYPES[File.extname(file).downcase]
    abort "#{id}: attachment '#{file}' must be an image (#{IMAGE_TYPES.keys.join(', ')})" unless type
    { 'path' => path, 'type' => type, 'caption' => a.is_a?(Hash) ? a['caption'].to_s.strip : '' }
  end
  data.delete('attachments') if data['attachments'].empty?
  [id,{ 'id' => id, 'data' => data, 'rels' => { 'parents' => [], 'spouses' => [], 'children' => [] } }]
end

link = lambda do |from, kind, to|
  abort "#{from}: unknown #{kind} id '#{to}'" unless nodes.key?(to)
  list = nodes[from]['rels'][kind]
  list << to unless list.include?(to)
end

people.each do |p|
  id = p['id'].to_s
  Array(p['parents']).map(&:to_s).each do |parent|
    link.(id, 'parents', parent)
    link.(parent, 'children', id)
  end
  # A spouse is an id, or { id:, married:, place: } with the marriage date and/or place
  # (the tree shows the year, the person panel the full date and place)
  Array(p['spouses']).each do |entry|
    spouse = (entry.is_a?(Hash) ? entry['id'] : entry).to_s
    link.(id, 'spouses', spouse)
    link.(spouse, 'spouses', id)
    next unless entry.is_a?(Hash)
    if entry['married']
      date = format_date(entry['married'], "#{id} married #{spouse}")
      nodes[id]['data']['married'][spouse] = date
      nodes[spouse]['data']['married'][id] = date
    end
    if entry['place']
      [[id, spouse], [spouse, id]].each { |a, b| (nodes[a]['data']['married_place'] ||= {})[b] = entry['place'].to_s.strip }
    end
  end
end

password = ENV['FAMILY_PASSWORD']
unless password
  print 'Password: '
  password = $stdin.noecho(&:gets).to_s.chomp
  print "\nRepeat password: "
  repeat = $stdin.noecho(&:gets).to_s.chomp
  puts
  abort 'Passwords do not match.' unless password == repeat
end
abort 'Password must be at least 12 characters.' if password.length < 12

def derive_key(password, salt)
  OpenSSL::KDF.pbkdf2_hmac(password, salt: salt, iterations: ITERATIONS, length: 32, hash: 'sha256')
end

# Returns ciphertext with the GCM auth tag appended, as Web Crypto expects
def encrypt_bytes(key, iv, data)
  cipher = OpenSSL::Cipher.new('aes-256-gcm').encrypt
  cipher.key = key
  cipher.iv = iv
  cipher.update(data) + cipher.final + cipher.auth_tag
end

# The salt of the current family.enc if this password opens it. Reusing it keeps the key
# the same, so unchanged attachments keep their encrypted files and git only sees real changes.
def existing_salt(password)
  old = JSON.parse(File.read(TARGET))
  return nil unless old['iterations'] == ITERATIONS
  salt, raw = Base64.strict_decode64(old['salt']), Base64.strict_decode64(old['data'])
  decipher = OpenSSL::Cipher.new('aes-256-gcm').decrypt
  decipher.key = derive_key(password, salt)
  decipher.iv = Base64.strict_decode64(old['iv'])
  decipher.auth_tag = raw[-16..]
  decipher.update(raw[0...-16]) + decipher.final
  salt
rescue StandardError
  nil
end

salt = existing_salt(password) || OpenSSL::Random.random_bytes(16)
key = derive_key(password, salt)

# Encrypted attachment files are named by a keyed hash of their content: the name reveals
# nothing, and an unchanged file maps to the same name so it isn't rewritten
Dir.mkdir(FILES_DIR) unless Dir.exist?(FILES_DIR)
used = []
nodes.each_value do |node|
  next unless node['data']['attachments']
  node['data']['attachments'].map! do |a|
    content = File.binread(a['path'])
    if content.bytesize > LARGE_FILE
      warn "Note: #{File.basename(a['path'])} is #{content.bytesize / 1_000_000} MB - consider resizing it"
    end
    name = OpenSSL::HMAC.hexdigest('SHA256', key, content)[0, 32] + '.enc'
    out = File.join(FILES_DIR, name)
    unless File.exist?(out)
      iv = OpenSSL::Random.random_bytes(12)
      File.binwrite(out, iv + encrypt_bytes(key, iv, content))
    end
    used << name
    { 'src' => "files/#{name}", 'type' => a['type'], 'caption' => a['caption'] }
  end
end
(Dir.children(FILES_DIR) - used).each { |stale| File.delete(File.join(FILES_DIR, stale)) if stale.end_with?('.enc') }

iv = OpenSSL::Random.random_bytes(12)
payload = {
  'v' => 1,
  'iterations' => ITERATIONS,
  'salt' => Base64.strict_encode64(salt),
  'iv' => Base64.strict_encode64(iv),
  'data' => Base64.strict_encode64(encrypt_bytes(key, iv, JSON.generate(nodes.values)))
}

File.write(TARGET, JSON.generate(payload))
puts "Encrypted #{nodes.size} people -> #{TARGET.sub(ROOT + '/', '')}"
puts "Attachments: #{used.size} in #{FILES_DIR.sub(ROOT + '/', '')}" if used.any?
