-- ============================================================
--  FlipujKáru — propojení s Telegramem
--  Bot po vstupu člena do skupiny zavolá /api/telegram-linked
--  (functions/api/telegram-linked.js) a ten sem zapíše záznam.
--  Klíčem je Checkout Session (ne účet) — bot může přijít dřív, než si
--  plátce založí účet (pay-first). K profilu se páruje přes
--  profiles.stripe_checkout_session_id (supabase/membership.sql).
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN. Bezpečné opakovaně.
-- ============================================================

create table if not exists public.telegram_links (
  session_id        text primary key,          -- Stripe Checkout Session (cs_live_…)
  telegram_user_id  bigint not null,
  telegram_username text,
  linked_at         timestamptz not null default now()
);

alter table public.telegram_links enable row level security;

-- Člen vidí jen záznam ke své platbě. Zapisuje jen backend (service role).
drop policy if exists "telegram_links_select_own" on public.telegram_links;
create policy "telegram_links_select_own" on public.telegram_links
  for select to authenticated
  using (session_id = (select stripe_checkout_session_id from public.profiles where id = auth.uid()));
