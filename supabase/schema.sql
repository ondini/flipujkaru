-- ============================================================
--  FlipujKáru — databázové schéma (Fáze B: účty zákazníků)
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
-- ============================================================

-- Profil uživatele (rozšiřuje vestavěnou tabulku auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer',          -- 'customer' | 'admin'
  stripe_customer_id text,                          -- napojení na Stripe (Fáze C)
  created_at timestamptz not null default now()
);

-- Zapnout zabezpečení na úrovni řádků
alter table public.profiles enable row level security;

-- Každý vidí a upravuje POUZE svůj profil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Po registraci automaticky vytvoř profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
