# Putting the app online

**Where you are:** the database is built, locked and backed up. This puts the
screens in front of teachers and parents.

**Nine steps, about 30 minutes.** Do them in order. Every step says what you
should see. If any step doesn't match, stop and send me what you got.

> **This is a second, separate repository from `sijill`.** That one is private
> and holds the database files and your backups. This one is public and holds
> only the app's code — no names, no data, no passwords. Keep them apart.

---

## Step 0 · One small database change first (5 min)

**Do this before anything else.** The app needs one extra thing from the
database that wasn't there when you ran the SQL: a way to ask "when did this
class last actually meet?", so that a teacher opening the app on a Saturday
lands on Friday's register instead of an error.

In the Supabase SQL editor, from the **new** `sijill-db` folder:

1. Run `09_api_teacher.sql` — select all, paste, Run. You should see
   `Success. No rows returned.`
2. Run `12_grants.sql` again — same. (Any time a function changes, 12 gets
   re-run. It is safe to run as often as you like.)
3. Check nothing came loose, exactly as before:

```sql
select
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r','p','v','m')
      and has_table_privilege('anon', c.oid, 'select'))     as tables_anon_can_read,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'api\_%'
      and has_function_privilege('anon', p.oid, 'execute')) as api_functions_open;
```

**Expect `0 | 38`.** If the first number isn't 0, stop and tell me.

---

## Step 1 · Make the repo

1. github.com → **+** → **New repository**
2. Name: `sijill-app`
3. Visibility: **Public**
4. Tick **Add a README file**
5. **Create repository**

Public is correct here and deliberate. The page contains code and one public
key — the same key our lockdown already assumes a stranger has. It contains no
child's name, no password and no data. GitHub Pages only serves public repos on
the free plan, and this is how every Supabase app in the world works.

---

## Step 2 · Upload the app files

**Add file → Upload files**, then drag in **everything inside the zip I send
you** — all fifteen files, nothing else, nothing left out. The zip contains
exactly the files that belong on the live site and nothing that does not, so
"drag in the whole zip's contents" is the entire rule. You do not need to
check them off against a list.

**What is in it, for reference:**

`index.html` · `family.html` · `guide.html` · `parent-guide.html` ·
`parent-guide-ar.html` · `api.js` · `app.js` · `coord.js` · `mushaf.js` ·
`family.js` · `i18n.js` · `sijill.css` · `manifest.json` ·
`icon-192.png` · `icon-512.png`

`guide.html` is the teacher's guide. It is a page in the app, linked from the
⚙ settings sheet, so a teacher who needs it mid-class is one tap away rather
than scrolling back through WhatsApp.

`parent-guide.html` and `parent-guide-ar.html` are the same thing for
families, in English and Arabic. The child's own page links to whichever one
matches the language they are reading, so a parent who has lost the PDF can
always find it again.

> **Never upload `config.js`.** It is the one file that is *yours*: it holds
> your Supabase address and key. Every zip I send has my test values in it
> (`127.0.0.1` and `DEV: true`), so uploading it points the live site at a
> server that does not exist and every sign-in fails with "could not reach the
> database". If that happens, open `config.js` in GitHub and put your two
> Supabase values back, with `DEV: false`.

**Do NOT upload these** — they are my testing tools and belong nowhere near
your live site. They are not in the zip, so this is only a problem if you are
copying out of the folder rather than the zip:

`devserver.py` · every `test-*.js` · `test.js` · `repro.js` ·
`run-tests.sh` · `package.sh` · `make-pdfs.js` · `build-ar-guide.py` ·
`fonts-compare.html` · the `.pdf` guides (those are for sending to people,
not for the site)

Also skip `logo.svg` and `logo-mark.svg`. They are the source I cut the
school mark from; the mark itself is written straight into the pages that use
it, so the app never fetches them. They stay in the folder only so the mark
can be re-cut later without going back to Illustrator.

**Updating later is the same step.** Drag the new zip's contents in over the
old ones and commit — GitHub replaces the files it recognises and leaves
everything else alone. `config.js` is never in the zip, so your Supabase
values survive every update without you doing anything.

**If a round comes with a `.sql` file, run that first**, in the Supabase SQL
editor, before you upload. `MIGRATIONS.md` in the `sijill-db` folder is the
running list of which ones you have run, and carries a query that tells you
the answer if you are not sure.

Commit.

---

## Step 3 · Put it online — Cloudflare Pages

**Superseded by `THIS-WEEK-STEP-1.md`, part A.** Follow that instead: it gives
you `sijill.pages.dev` rather than an address with GitHub and your own brand
name in it, it serves private repositories, and it costs nothing.

The short version: dash.cloudflare.com → **Workers & Pages** → **Create
application** → **Pages** → **Connect to Git** → pick `sijill-app` → set the
**project name** (that becomes the address) → leave **build command** and
**build output directory** completely empty → **Save and Deploy**.

Then turn GitHub Pages **off** (repo → Settings → Pages → Source: *None*), so
there is exactly one address for people to bookmark.

Open your new address. **You should see the Sijill sign-in screen** — and
typing anything into it should fail, because it isn't pointed at your database
yet. That's Step 4.

---

## Step 4 · Point it at your database

1. Supabase → the green **Connect** button → the **Framework** tab
2. You will see two lines like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://pcwxkwlpblyztugxvwnk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxx
```

3. In GitHub, open `config.js`, click the **pencil**, and put those two values
   between the quotes. Also set `DEV` to `false`:

```js
window.SIJILL = {
  SUPABASE_URL: "https://pcwxkwlpblyztugxvwnk.supabase.co",
  SUPABASE_KEY: "sb_publishable_xxxxxxxxxxxxxxx",
  SCHOOL_NAME: "Qur’an School",
  DEV: false
};
```

4. Commit. Wait a minute for GitHub to republish.

**Keep the quotes. Keep the commas.** If you delete one by accident the page
goes blank — put it back and it recovers; nothing is damaged.

**Never put the database password or the connection string in this file.**
Those are a completely different thing and they live only in the private repo's
GitHub secrets.

---

## Step 5 · Sign in for the first time

Open your new `*.pages.dev` address on your **phone**, since that's where
teachers will use it.

1. Type the **school passphrase** → you should see the list of ten teachers
2. Pick your own name → you should see a class register with real students

**If you get "Could not reach the database"** — the URL in `config.js` is wrong
or has a stray character. **If you get "no API key found"** — the key is wrong.
**If the page is blank** — you broke the punctuation in `config.js`; compare it
to the block above.

**Add it to your home screen** while you're there — Safari: Share → Add to Home
Screen. Android Chrome: ⋮ → Add to Home screen. It then opens like an app, with
no browser bar. Tell the teachers to do the same.

---

## Step 6 · Try it properly, on real data

This is a live database, so what you do here is real — but everything is
undoable, so try things.

- **Mark all present**, then change one child to absent → a reason appears
- Tap a **name** → the student sheet
- Mark something **↻ repeat** → it appears under "Homework for next week"
  by itself
- Switch to **العربية** and back
- **Coordinator tools** → your second passphrase → the school dashboard

Then clean up what you just did: Coordinator → **Manage → Change log** → Undo
the entries you made. Or leave them; Friday will overwrite them anyway.

---

## Step 7 · Issue the parent links

Coordinator tools → **Manage → Links → + Issue a link**.

Tick the children one adult should see, choose "mother"/"father", choose how
you'll send it, press **Issue**.

**The link is shown once and never again.** Only its scrambled form is stored,
which is exactly why a stolen database opens nobody's page. Copy it and send it
straight away. If it's lost you don't look it up — you press **Replace**, which
kills the old one and gives you a new one.

Send one link per adult, not one per family. Two parents get two links.

---

## Step 8 · Tell the teachers

Send them **TEACHER-GUIDE.md** first — it is two minutes long and answers
the questions you would otherwise get ten times on Friday night.

Then the address and the school passphrase, on two separate messages if you're
being careful. Something like:

> Assalamu alaykum. From Friday we're recording the register and recitation on
> the phone instead of paper.
>
> Link: (your pages.dev address)
> Passphrase: (the school one)
>
> Open it once before Friday, add it to your home screen, and pick your name
> from the list. It remembers you after that. Anything you tap can be undone.
> If it won't work on the night, use paper and tell me — nothing is lost.

That last sentence matters. Ten volunteers, first night, one shared passphrase:
have a paper fallback and say so out loud, so nobody spends the class fighting
a phone instead of teaching.

---

## Step 9 · Tell the parents

Send the handbook first, then each family's link. Don't send links without the
handbook — the questions you'll get are the ones it answers.

---

## Changing something later

Everything is plain files in the repo. Edit a file on GitHub, commit, wait a
minute, reload — Cloudflare redeploys by itself every time you push. There is
no build step and nothing to install.

If you break something, GitHub keeps every version: open the file → **History**
→ pick the last good version → **Revert**.

---

## What is NOT in this version

Honest list, so nothing is a surprise on Friday:

- **Teachers cannot close a class day.** By design — that's coordinator-only.
  Snow day: you do it from Coordinator → Manage → Calendar.
- **No offline mode.** If the wifi drops mid-class, marks fail and you get a
  red banner with a Retry button. Nothing is lost, but nothing saves until the
  connection is back.
- **No push notifications** to parents. They open the link when they choose.
  On iPhone these only work if the parent has first added the page to their
  home screen, so a good share of families would silently never get them —
  which is worse than none, because you would believe they had been told.
- **No progress trend** (the green / amber / red arrow per student) yet. It
  reads data we already have, so it is safe to add once a few real weeks have
  gone by and the thresholds can be set from what actually happens rather than
  guessed now.

Everything else from the first round of testing is in: taking a mark back,
reading and editing notes, the real mushaf tree, teachers and classes managed
from the app, the duplicate-homework warning, the one-tap tick on the register,
and the layout and labelling fixes.
