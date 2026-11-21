-- ============================================================
--  FlipujKáru — odběr novinek (formulář „Kontakt" na úvodní stránce).
--  Vkládá se VÝHRADNĚ přes serverovou funkci /api/newsletter (service
--  role, honeypot, rate-limit) — z prohlížeče do tabulky zapsat nejde.
--  Číst / mazat (odhlášení) smí jen admin.
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
--  Bezpečné pustit i opakovaně. Vyžaduje referrals.sql (is_admin).
-- ============================================================

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 200 and email = lower(email)),
  source text not null default 'web' check (char_length(source) <= 40),
  created_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_created_idx on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Žádná insert/update politika → anon/authenticated nic nevloží (jen service role přes funkci).
drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

drop policy if exists "newsletter_delete_admin" on public.newsletter_subscribers;
create policy "newsletter_delete_admin" on public.newsletter_subscribers
  for delete to authenticated using (public.is_admin());
