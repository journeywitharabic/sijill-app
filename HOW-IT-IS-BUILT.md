# Sijill — how it is built

A technical note. Written for the brothers with a development background, and
for whoever inherits this in three years.

**Cost: nothing.** Free tiers throughout, and no subscription anywhere.

---

## The shape of it

```
         phone browser                     Cloudflare Pages
    ┌────────────────────┐            ┌──────────────────────┐
    │  index.html        │  static    │  14 files, no build  │
    │  app.js  coord.js  │◄───────────┤  redeployed on push  │
    │  mushaf.js  …      │            └──────────────────────┘
    └─────────┬──────────┘                      ▲
              │  HTTPS, one public key          │ git push
              │  POST /rest/v1/rpc/api_*        │
              ▼                          ┌──────┴──────┐
    ┌─────────────────────┐              │   GitHub    │
    │  Supabase           │              └─────────────┘
    │  PostgreSQL 17      │                     │ nightly
    │  + PostgREST        │                     ▼
    │                     │              ┌─────────────┐
    │  21 tables, RLS on  │              │  pg_dump    │
    │  47 api_ functions  │              │  → private  │
    │  0 readable tables  │              │    repo     │
    └─────────────────────┘              └─────────────┘
```

Three moving parts, two of them rented, none of them ours to operate.

- **No server.** No Node process, no container, no deploy pipeline, nothing to
  patch at 11pm. The app is plain files; the database is managed.
- **No build step.** No npm, no bundler, no framework. Edit a file on GitHub,
  commit, and Cloudflare republishes in under a minute. Anyone who can read
  JavaScript can change this without installing anything.
- **No dependencies in the browser.** No React, no jQuery, no web fonts. The
  whole front end is about 3,700 lines of plain ES5 and CSS. It loads on a weak
  mosque signal because there is almost nothing to load.

---

## The security model, which is the interesting part

Supabase publishes the database over HTTP using a key that is **embedded in the
page source**. Anyone can read it. That is not a flaw and it is not a
compromise — it is the design, and everything else follows from assuming a
stranger already has that key.

Three layers, and the key defeats none of them:

**1. Row-level security is on for every table, with no policies.**
RLS with no policies means *deny all*. There is no `select` a stranger can make
that returns a row. Verified, not assumed: `12_grants.sql` refuses to finish if
a single table, view or materialised view is readable by the anonymous role.

```
 tables_anon_can_read
 --------------------
                    0
```

**2. Everything goes through 47 `SECURITY DEFINER` functions.**
The functions run as the owner, so they can see the tables the caller cannot.
Each one begins by checking a session, and the ones that matter check a role:

- `_session()` — signed in with the school passphrase
- `_teacher()` — …and has said which teacher they are
- `_coord()`  — …and has entered the second passphrase

Anything whose name starts with `_` is revoked from the web entirely. Only the
`api_*` surface is reachable, and `12_grants.sql` re-derives that list from the
catalogue every time it runs rather than trusting a hand-written one.

**3. Passphrases are bcrypt hashes; link tokens are sha256.**
Nothing is stored in a form that can be read back. A parent's link is shown
**once**, at issue, and only its hash is kept — so a stolen database dump opens
nobody's page. Losing a link means issuing a new one, which is the correct
answer and is one tap.

### Children's privacy, structurally rather than by policy

**There is no column anywhere that can hold a parent's name, phone number or
email.** Not "we don't collect it" — there is nowhere to put it. A guardian row
is a role (`mother`, `father`), a token hash, and which children it covers. The
mapping from that to an actual human being lives in ClassDojo, which the school
already uses and already has consent for.

Several of the teachers are also parents of enrolled children, so the teacher
app can never see another family's link, and the parent page can never see
another family's child.

---

## Where the data lives

**21 tables.** The interesting shape decisions:

- **Recitation is append-only.** A `sessions` row is a fact about what happened
  and is never edited. A mistake is *voided* — stamped `voided_at` and ignored
  everywhere — rather than deleted, because when two people remember an evening
  differently, the fact that someone corrected themselves is the evidence you
  want.
- **Memorisation is stored run-length encoded.** `hifdh_state` holds one row per
  student per surah; a partly-memorised surah carries a map like `1:12,0:28` —
  twelve ayat solid, then twenty-eight not started. 114 rows per child maximum,
  and a whole surah costs one row.
- **Progress is measured in pages, not surahs.** A `quran_ayah` table of all
  **6,236 ayat** maps each one to its page, juz and hizb, so a child working
  through Surah Yusuf shows movement every week. Surah counting is meaningless
  past juz 29 — juz 30 has 37 surahs and juz 12 has three.
- **Every write that changes existing data records what it replaced.**
  `change_log` holds before-and-after as JSON, which is what makes "somebody
  messed up the data" recoverable one row at a time instead of by restoring a
  backup.
- **Non-overlapping enrolments are enforced by the database**, not by the app:
  an `EXCLUDE USING gist` constraint over `(student_id, daterange)`. A child
  cannot be in two classes at once even if a future bug tries.

**Seven views** do the arithmetic — pages solid per juz, which families open
their link, which class days have gaps.

---

## Backups

A GitHub Action runs `pg_dump` nightly into a private repository and refuses to
finish if the dump is implausible — fewer than ten tables or fewer than a
thousand rows means something went wrong and the failure is loud. Optional
AES-256 before it lands.

The free Supabase plan has no automated backups, which is exactly why this
exists. It is also why there is no point-in-time restore: the recovery target
is last night, so anything irreversible gets a manual run first.

---

## Testing

**195 automated checks in six suites**, driving a real browser against a real
PostgreSQL with the real roster loaded. A local Python shim stands in for
PostgREST and — importantly — sets the `anon` role, so the tests hit the same
permission wall a stranger would.

The suites do not check that functions return values. They check things like:

- a parent link cannot mark attendance (expects HTTP 401)
- rotating the school passphrase signs every phone out
- no link hash ever reaches the change log, since that log is dumped to GitHub
- closing a day excuses every child, and reopening restores exactly what the
  teachers had recorded before it
- taking two marks back in a row, newest first, works
- the register does not scroll sideways at 320px, 390px or 414px
- every tap target is at least 32px
- the settings buttons have real contrast in **both** light and dark themes

That last one exists because they were once white on white, and a test that
measures the computed colours is the only way that stays fixed.

This harness is the reason the honest list of defects in this project is short.
Most of what it caught was mine: a sticky header silently broken by
`overflow-x: hidden`, a `[hidden]` attribute defeated by class specificity, an
undo that refused the commonest case, progress bars rendering as 60px blobs,
and a trend rule that told all 34 children they were moving forward on an empty
record.

---

## What it deliberately does not have

- **No offline mode.** A dropped signal means a red banner and a Retry button,
  and the paper fallback is in the teacher guide. Offline sync for a tool used
  twice a week is a large amount of complexity bought with a small amount of
  convenience, and it is the kind that goes wrong quietly.
- **No push notifications.** On iPhone, web push requires the parent to have
  added the page to their home screen first, so a good share of families would
  silently never receive them — which is worse than none, because you would
  believe they had been told.
- **No accounts.** Two shared passphrases and a name you pick from a list. Ten
  volunteers will not maintain ten passwords, and pretending otherwise produces
  one password written on the inside of a cupboard door.
- **One unused column.** `guardians.channel` recorded how a link was going to be
  sent, which turned out to answer nothing. The dropdown is gone; the column is
  left in place rather than migrated, and is noted here so the next person knows
  it is dead rather than mysterious.

---

## The files

| | |
|---|---|
| `01_schema.sql` | every table, every constraint, RLS on |
| `02`–`06` | roster, calendar, the September audit, the 6,236-ayah Qur'an map, the pages arithmetic |
| `07`–`11` | the views and the 47 `api_*` functions, by role |
| `12_grants.sql` | revoke everything, grant back exactly the front door, then prove it |
| `13_test_access.sql` | a 39-step rehearsal a coordinator can run and read |
| `20_upgrade_week1.sql` | the one structural migration since launch |
| `index.html` + 6 `.js` + 1 `.css` | the whole front end |
| `test*.js`, `run-tests.sh` | the 195 checks — never uploaded to the public repo |

Two repositories: a **private** one for the database files and the backups, and
a **public** one for the app, which contains code and one public key and no
child's name. The September audit file stays out of both — it is pseudonymous
rather than anonymous, and a stable key plus a known namespace is a
confirmation oracle.

---

## If you are picking this up

Read `01_schema.sql` first — the comments there explain the *why* of every
decision above, and they were written for you. Then `08_access.sql`, which is
the security model in about 460 lines. Then run `./run-tests.sh`; if it says
`EVERYTHING PASSED` you have a working local copy of the whole system, roster
and all, and you can break things freely.
