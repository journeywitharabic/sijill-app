# Sijill — the app

Plain HTML, CSS and JavaScript. No build step, no framework, no npm install.
Edit a file, commit, reload. That is deliberate: this has to be maintainable by
whoever runs the madrasah in three years, not just by whoever wrote it.

## What goes online

| File | What it is |
|---|---|
| `index.html` | Teacher and coordinator app |
| `family.html` | The read-only page a parent or older student opens |
| `config.js` | **The only file you edit** — your Supabase address and public key |
| `api.js` | Every network call in the whole app lives here, and nowhere else |
| `app.js` | Sign-in, class register, student sheet |
| `coord.js` | School dashboard, Manage, Statistics |
| `family.js` | The parent page |
| `i18n.js` | English and Arabic |
| `sijill.css` | The stylesheet, unchanged from the signed-off mockup |
| `manifest.json`, `icon-*.png` | Lets it be added to a phone's home screen |

## What stays on your computer

`devserver.py`, `test.js`, `test-coord.js`, `test-family.js`, `run-tests.sh` —
testing tools. Do not upload them.

## Running the tests

```
./run-tests.sh
```

Rebuilds a throwaway database from `../sijill-db`, starts a local stand-in for
Supabase, and clicks through all three apps in a real browser: signing in,
marking a register, recording recitations, issuing a link, opening it as a
parent, closing a day, undoing a mistake. Screenshots land in `/var/tmp/shots`.

Everything must say **ALL CHECKS PASSED**.

`devserver.py` is not a mock. It runs every call as the `anon` Postgres role,
so the grants and row-level security are genuinely enforced — if a screen tries
to touch something it shouldn't, it fails locally exactly as it would in
production. It also passes arguments untyped, the way PostgREST does, because
passing them typed hides a whole class of "function does not exist" errors
until you are live.

## The one thing worth knowing about api.js

Supabase has two generations of public key. The legacy `anon` key is a JWT and
wants both the `apikey` and `Authorization: Bearer` headers. The newer
`sb_publishable_...` key must go on `apikey` **only** — send it as a Bearer
token too and Supabase tries to parse it as a JWT and rejects the request.
`api.js` looks at the key and sends what that kind of key expects. If you ever
rewrite the network layer, keep that.
