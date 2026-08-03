import { createClient } from '@supabase/supabase-js';

/* ============================================================
   Klient Supabase (databáze + přihlašování + úložiště fotek).
   Klíče se berou z .env:
     VITE_SUPABASE_URL        – adresa projektu (veřejná)
     VITE_SUPABASE_ANON_KEY   – veřejný „anon" klíč (smí do prohlížeče)
   Tajný SERVICE_ROLE klíč žije POUZE na serveru (api/), nikdy tady.

   Dokud nejsou klíče vyplněné, supabase = null a web normálně běží
   (jen funkce účtů/dat zatím nic nedělají).
============================================================ */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_READY = Boolean(url && anonKey);

export const supabase = SUPABASE_READY
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
