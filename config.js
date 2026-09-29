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
  SUPABASE_URL: "https://pcwxkwlpblyztugxvwnk.supabase.co",

  // The publishable / anon key — the public one
  SUPABASE_KEY: "sb_publishable_pNL06hdyJ4ZnBB6kCO1w5g_-Cyt4VAF",

  // The school's name, as it appears at the top of every screen
  SCHOOL_NAME: "Ommah Madrasah",
   
  SITE_HOST: "sijill-app.pages.dev",
   
  // Set to true only while testing against the local dev server.
  DEV: false
};
