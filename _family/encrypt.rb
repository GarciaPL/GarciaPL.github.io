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
  [id, { 'id' => id, 'data' => data, 'rels' => { 'parents' => [], 'spouses' => [], 'children' => [] } }]
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
  # A spouse is an id, or { id:, married: } with the marriage date
  # (the tree shows the year, the person panel the full date)
  Array(p['spouses']).each do |entry|
    spouse = (entry.is_a?(Hash) ? entry['id'] : entry).to_s
    link.(id, 'spouses', spouse)
    link.(spouse, 'spouses', id)
    next unless entry.is_a?(Hash) && entry['married']
    date = format_date(entry['married'], "#{id} married #{spouse}")
    nodes[id]['data']['married'][spouse] = date
    nodes[spouse]['data']['married'][id] = date
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

salt = OpenSSL::Random.random_bytes(16)
iv = OpenSSL::Random.random_bytes(12)
key = OpenSSL::KDF.pbkdf2_hmac(password, salt: salt, iterations: ITERATIONS, length: 32, hash: 'sha256')

cipher = OpenSSL::Cipher.new('aes-256-gcm').encrypt
cipher.key = key
cipher.iv = iv
ciphertext = cipher.update(JSON.generate(nodes.values)) + cipher.final

payload = {
  'v' => 1,
  'iterations' => ITERATIONS,
  'salt' => Base64.strict_encode64(salt),
  'iv' => Base64.strict_encode64(iv),
  # Web Crypto expects the GCM auth tag appended to the ciphertext
  'data' => Base64.strict_encode64(ciphertext + cipher.auth_tag)
}

File.write(TARGET, JSON.generate(payload))
puts "Encrypted #{nodes.size} people -> #{TARGET.sub(ROOT + '/', '')}"
