-- ============================================================
--  FlipujKáru — Moje flipy: napojení na databázi aut + žebříčky
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
--  Bezpečné pustit i opakovaně (if not exists / drop + create policy).
-- ============================================================

-- Tabulka vlastních flipů členů (vytvoří se, pokud ještě neexistuje)
create table if not exists public.user_flips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  brand text not null,
  model text not null,
  buy numeric not null default 0,
  repair numeric not null default 0,
  sell numeric not null default 0,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);

-- Napojení flipu na konkrétní auto z bazaru (výběr místo volného textu)
alter table public.user_flips add column if not exists car_id uuid references public.cars (id) on delete set null;

create index if not exists user_flips_user_id_idx on public.user_flips (user_id);

alter table public.user_flips enable row level security;

drop policy if exists "user_flips_select_own" on public.user_flips;
create policy "user_flips_select_own" on public.user_flips
  for select using (auth.uid() = user_id);

drop policy if exists "user_flips_insert_own" on public.user_flips;
create policy "user_flips_insert_own" on public.user_flips
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_flips_delete_own" on public.user_flips;
create policy "user_flips_delete_own" on public.user_flips
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Žebříčky (SECURITY DEFINER — čte přes hranice řádkového
--  zabezpečení jen agregovaná/anonymizovaná data pro přihlášené členy).
-- ------------------------------------------------------------

-- Jméno pro žebříček: křestní jméno + iniciála příjmení (ochrana soukromí)
create or replace function public.leaderboard_display_name(full_name text)
returns text
language sql
immutable
as $$
  select trim(
    split_part(coalesce(full_name, 'Člen'), ' ', 1) ||
    case when split_part(coalesce(full_name, ''), ' ', 2) <> ''
      then ' ' || left(split_part(full_name, ' ', 2), 1) || '.'
      else '' end
  );
$$;

-- Nejlepší jednotlivé flipy napříč celou komunitou
create or replace function public.leaderboard_top_flips(limit_count int default 10)
returns table (brand text, model text, profit numeric, display_name text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select
    f.brand,
    f.model,
    (f.sell - f.buy - f.repair) as profit,
    public.leaderboard_display_name(p.full_name) as display_name,
    f.created_at
  from public.user_flips f
  join public.profiles p on p.id = f.user_id
  where f.status = 'sold'
  order by profit desc
  limit greatest(limit_count, 1);
$$;

revoke execute on function public.leaderboard_top_flips(int) from public, anon;
grant execute on function public.leaderboard_top_flips(int) to authenticated;

-- Nejlepší uživatelé podle celkového zisku ze všech prodaných flipů
create or replace function public.leaderboard_top_users(limit_count int default 10)
returns table (display_name text, flips_count bigint, total_profit numeric, is_me boolean)
language sql
security definer
set search_path = public
stable
as $$
  select
    public.leaderboard_display_name(p.full_name) as display_name,
    count(*) as flips_count,
    sum(f.sell - f.buy - f.repair) as total_profit,
    (f.user_id = auth.uid()) as is_me
  from public.user_flips f
  join public.profiles p on p.id = f.user_id
  where f.status = 'sold'
  group by p.id, p.full_name, f.user_id
  order by total_profit desc
  limit greatest(limit_count, 1);
$$;

revoke execute on function public.leaderboard_top_users(int) from public, anon;
grant execute on function public.leaderboard_top_users(int) to authenticated;
