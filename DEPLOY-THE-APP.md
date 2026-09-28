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

**Add file → Upload files**, drag in everything from the `sijill-app` folder
**except** the three testing files:

**Upload these ten:**

`index.html` · `family.html` · `config.js` · `api.js` · `app.js` · `coord.js` ·
`family.js` · `i18n.js` · `sijill.css` · `manifest.json` ·
`icon-192.png` · `icon-512.png`

**Do NOT upload these** — they are my testing tools and belong nowhere near
your live site:

`devserver.py` · `test.js` · `test-coord.js` · `test-family.js`

Commit.

---

## Step 3 · Turn on GitHub Pages

1. In the repo: **Settings → Pages**
2. Under **Source**, choose **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**. **Save**
4. Wait about a minute, then reload the page. It will show your address:

```
https://journeywitharabic.github.io/sijill-app/
```

Open it. **You should see the Sijill sign-in screen** — and typing anything
into it should fail, because it isn't pointed at your database yet. That's Step 4.

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
  SCHOOL_NAME: "Ommah Madrasah",
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

Open `https://journeywitharabic.github.io/sijill-app/` on your **phone**, since
that's where teachers will use it.

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

Send them the address and the school passphrase, on two separate messages if
you're being careful. Something like:

> Assalamu alaykum. From Friday we're recording the register and recitation on
> the phone instead of paper.
>
> Link: https://journeywitharabic.github.io/sijill-app/
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
minute, reload. There is no build step and nothing to install.

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
- **Adding teachers and classes** from the app isn't built yet. Students are —
  add, move between classes, and remove. Teachers and classes can be done in
  the Supabase SQL editor meanwhile, and a teacher who isn't on the list can
  add themselves from the sign-in screen.
- **The full mushaf tree** opens as a searchable list of all 114 surahs rather
  than the juz-by-juz tree from the audit tool. It works; it is just plainer.

None of these stops Friday working. Tell me which matter and I'll build them next.
