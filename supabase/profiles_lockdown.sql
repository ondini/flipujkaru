-- ============================================================
--  FlipujKáru — uzamčení citlivých sloupců profilu
--  Politika profiles_update_own pouští uživatele k úpravě vlastního
--  řádku, ale RLS neomezuje sloupce — bez tohohle si kdokoli přihlášený
--  mohl přes API nastavit role = 'admin' nebo plan/subscription_status
--  (a tím obejít admin politiky na cars/content i členské materiály).
--  Členství zapisuje jen backend (service role, RLS i granty obchází).
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN. Bezpečné opakovaně.
-- ============================================================

revoke insert, update, delete, truncate on public.profiles from anon, authenticated;

-- Uživatel smí měnit jen své jméno (řádek dál hlídá profiles_update_own)
grant update (full_name) on public.profiles to authenticated;
