-- ============================================================
--  FlipujKáru — členství na profilu (Stripe)
--  Přidá k tabulce profiles pole, do kterých backend zapisuje
--  stav předplatného po platbě (api/activate-membership.js), a která
--  frontend čte při přihlášení (AppContext.loadMembership).
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
--  Bezpečné pustit i opakovaně (add column if not exists).
-- ============================================================

alter table public.profiles add column if not exists plan                 text;         -- název plánu (např. AKADEMIE)
alter table public.profiles add column if not exists subscription_status  text;         -- 'active' | 'canceled' | …
alter table public.profiles add column if not exists current_period_end   timestamptz;  -- do kdy je členství zaplacené
alter table public.profiles add column if not exists stripe_subscription_id text;        -- ID předplatného ve Stripe
