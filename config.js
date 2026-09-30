/* ============================================================================
   Sijill · سِجِلّ — the only file you have to edit.
   ============================================================================

   Two values, both copied from Supabase. Neither is a secret: the key below
   is the PUBLIC one, it is meant to sit in a web page where anyone can read
   it, and the whole database is built on the assumption that a stranger has
   it. It opens nothing on its own — every door checks who is knocking.

   WHERE TO FIND THEM
     Supabase dashboard -> the green "Connect" button -> the "Framework" tab.
     You will see two lines that look like this:

       NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
       NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxx

     Copy what comes after each "=" into the two slots below, between the
     quotes. Keep the quotes. Nothing else in this file needs touching.

   NEVER put the database password or the connection string here. Those are
   different things entirely and they belong only in GitHub secrets.
   ============================================================================ */

window.SIJILL = {

  // The https://....supabase.co address of your project
  SUPABASE_URL: "http://127.0.0.1:8099",

  // The publishable / anon key — the public one
  SUPABASE_KEY: "local-anon-key-for-testing-only",

  // The school's name, as it appears at the top of every screen.
  // Leave it empty and the app uses its own translated name
  // ("Qur’an School" / "مَدْرَسَةُ القُرْآنِ"), which follows the
  // reader's language. Fill it in only to run this for a different school.
  SCHOOL_NAME: "",

  // The one permanent address of this site, with no https:// and no
  // trailing slash. On Cloudflare Pages this is the address on the
  // "Domains:" line of the deployment page, NOT the one with a hash in
  // front of it.
  //
  //     right   sijill-app.pages.dev
  //     wrong   128ef441.sijill-app.pages.dev
  //
  // Every build gets its own hashed address. Issue a family link while you
  // happen to be standing on one of those and the link carries that hash
  // for ever, pointing at a frozen copy of the app. Naming the real address
  // here means links are always built from it, whichever page you are on,
  // and the app warns you if you are somewhere else.
  //
  // Leave it empty and the app falls back to whatever address you are on.
  // When you buy a domain, change this line and reissue the links.
  SITE_HOST: "",

  // Set to true only while testing against the local dev server.
  DEV: true
};
