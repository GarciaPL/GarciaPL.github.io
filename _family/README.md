# Family tree

Setup and maintenance notes for the private family tree page.

The page lives at https://www.whoishiring.dev/family/ (locally: http://localhost:4000/family/).

## How it works

1. Real data is in `_family/family-private.yml` – plain text, **gitignored**, exists only on this computer.
2. `ruby _family/encrypt.rb` encrypts it with a password into `assets/family/family.enc`.
3. Only `family.enc` is committed. It is unreadable without the password.
4. The page asks for the password and decrypts the data in the visitor's browser.

The password is **not stored anywhere** – not in the repo, the page, or any config.
It only exists in your head / password manager and in the encrypted file's lock.

## The page

- The page is in Polish (`lang: pl`).
- Shows only a centred "Drzewo genealogiczne" title and a password box – no blog header, menu, social icons or footer.
- The password is asked on every visit (nothing is remembered in the browser).
- After unlocking, the **whole family is drawn at once**: one row per generation, partners side by side,
  lines down to their children. Nobody is ever hidden. Drag to move, scroll / pinch to zoom.
- Each card shows the name, `z d. Nowak` for a maiden name, `* 14.03.1925` for born and `† 02.01.1998`
  for died – as much of the date as is known (`* 03.1925`, `* 1925`, `* ok. 1890`, `† przed 1950`, `* ?`).
  No `†` line for living people.
- Partners are joined by a short line, with the marriage year above it (`⚭ 1950`, `⚭ ok. 1950`) when it's known.
  Their children's line starts from the middle of it.
- **Tapping a card** opens a panel with the details (only rows that have data are shown):
  Nazwisko rodowe, Urodzenie (date, place), Śmierć (date, place), Wiek, Pochówek, Zawód,
  Miejsca zamieszkania, Małżeństwo (with full marriage date), Rodzice, Rodzeństwo, Dzieci, and the notes.
  It also highlights the person's ancestors and descendants and fades everyone else.
  Close with ×, Esc, or a tap on empty space.
- **Wiek** (age) is calculated: current age for living people, age at death otherwise (`72 lata`, `ok. 82 lata`).
  It gets `ok.` when a date is approximate or missing day/month, and is left out when a date is
  only known as `przed`/`po`, is `?`, or a living person would be over 110.
- The tree is fitted to the screen. On phones it is kept at a readable size instead, so you drag to see the rest.
- Hidden from search and tracking: not linked from the menu, not in the sitemap, `noindex`,
  and Google Analytics is off. These are set in the front matter of `family/index.html`:

  ```yaml
  noindex: true       # <meta name="robots" content="noindex, nofollow"> (_includes/head.html)
  analytics: false    # skips Google Analytics (_includes/head.html)
  sitemap: false      # excluded by jekyll-sitemap
  hide_header: true   # no site header (_layouts/default.html)
  hide_footer: true   # no site footer (_layouts/default.html)
  ```

## Files

| File | Committed? | What it is |
|---|---|---|
| `_family/family-private.yml` | No (gitignored) | Real family data |
| `_family/family-sample.yml` | Yes | Placeholder data showing the format |
| `_family/encrypt.rb` | Yes | Encryption script |
| `_family/README.md` | Yes | This file |
| `assets/family/family.enc` | Yes | Encrypted data served to the page |
| `assets/family/family-tree.js` | Yes | Password form, decryption, tree layout and drawing |
| `family/index.html` | Yes | The page |
| `_includes/head.html` | Yes | Shared – supports `noindex` and `analytics: false` |
| `_layouts/default.html` | Yes | Shared – supports `hide_header` and `hide_footer` |

Jekyll doesn't publish folders starting with `_`, so nothing in `_family/` ends up on the site.

## First-time setup

```bash
cp _family/family-sample.yml _family/family-private.yml
```

Replace the placeholder people with real ones, then encrypt (below).

## Editing the data

Edit `_family/family-private.yml`. Each person:

```yaml
- id: piotr              # unique short id, used to link people
  name: Piotr Kowalski
  gender: M              # M or F (card colour; also zmarł/zmarła)
  maiden_name: Nowak     # optional – surname before marriage, shown as "z d. Nowak"
  born: 1952-02-21       # optional – 1952, 1952-02 or 1952-02-21
  died: 2020-05          # optional – same formats; leave out for living people
  parents: [jan, anna]   # optional – ids
  spouses:               # optional – only needed on one side
    - { id: maria, married: 1978-09-16 }   # marriage date optional; the tree shows the year
  # Optional details for the panel:
  birthplace: Warszawa
  deathplace: Gdańsk
  buried: Cmentarz Powązkowski, Warszawa
  occupation: Lekarz
  lived: [Warszawa, Gdańsk]
  notes: |
    Free text, several lines allowed.
```

A spouse without a known marriage date can be just the id: `spouses: [maria]`.
Dates must be written year first (`1952-02-21`); other formats like `21.02.1952` are rejected.
Uncertain dates: put `ok.`, `przed` or `po` in front (`born: ok. 1890`, `died: przed 1950-05`,
`married: po 1920`). A completely unknown date is `"?"` **with quotes** – a bare `?` breaks the file.
Children are worked out from `parents`, so don't list them.
The order of people in the file doesn't matter – the layout works out the generations itself.
Two people who share a child are drawn side by side even if they aren't listed as spouses.

## Encrypting (after every data change)

```bash
ruby _family/encrypt.rb
```

- Asks for the password twice (typing is hidden).
- Password must be at least 12 characters. Prefer a long passphrase, e.g. `oak-river-grandma-1952-blue`.
- Checks for duplicate ids, unknown ids in parents/spouses, gender other than M/F, and badly written dates.
- Writes `assets/family/family.enc`.
- Optional: pass a different data file, `ruby _family/encrypt.rb path/to/file.yml`.

Then commit and push:

```bash
git add assets/family/family.enc
git commit -m "Update family tree"
git push
```

Avoid `FAMILY_PASSWORD=... ruby _family/encrypt.rb` for the real password – it ends up in shell history.

## Previewing locally

```bash
bundle exec jekyll serve
```

Open http://localhost:4000/family/ and enter the password. After re-encrypting, just refresh.

`jekyll serve` rewrites files in `_site/`, which git tracks in this repo. Before committing, run:

```bash
git checkout -- _site
```

## Changing the password

Run `ruby _family/encrypt.rb` again with the new password and commit `family.enc`.
The old password stops working immediately. Send the new one to family.

## Forgotten password

It cannot be recovered. Re-run `ruby _family/encrypt.rb` with a new password –
that only needs `family-private.yml`.

## Backups

`family-private.yml` exists only on this computer. **Keep a private backup** (cloud drive,
password manager attachment, USB stick). The page can still show the tree from `family.enc`
with the password, but there is no script to turn `family.enc` back into the YAML file –
without the backup you'd have to retype the data.

## Security notes

- Encryption: PBKDF2-SHA256 (600,000 iterations) → AES-256-GCM. The browser uses the
  built-in Web Crypto API; Ruby uses its built-in OpenSSL. Keep the two in sync if either changes.
- Anyone can download `family.enc` and guess passwords offline, so the password's
  strength is the real protection.
- Everyone shares one password – access can't be revoked per person, only by changing it.
- Libraries load from jsDelivr, pinned to exact versions with `integrity` hashes
  (the browser refuses a file that doesn't match): d3 7.9.0 (drawing, drag and zoom) and
  @dagrejs/dagre 3.1.1 (sorts people into generation rows; `family-tree.js` then positions them).
  To upgrade, change the version in the two URLs in `family/index.html` and recompute each hash:

  ```bash
  curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
  ```

  Prefix the result with `sha384-`, then check the tree still works.
