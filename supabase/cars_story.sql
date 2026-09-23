-- ============================================================
--  FlipujKáru — příběh flipu u aut
--  Přidá pole pro „úspěšné flipy" k tabulce cars.
--  Když se auto označí jako Prodáno, tyhle údaje se ukážou v
--  sekci „Ukázky úspěšných flipů".
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
--  Bezpečné pustit i opakovaně (add column if not exists).
-- ============================================================

alter table public.cars add column if not exists buy_price   numeric;  -- nákupní cena
alter table public.cars add column if not exists repair_cost numeric;  -- náklady na opravu
alter table public.cars add column if not exists sell_price  numeric;  -- prodejní cena (výchozí = price)
alter table public.cars add column if not exists flip_weeks  integer;  -- délka flipu v týdnech
alter table public.cars add column if not exists location    text;     -- lokalita nálezu
alter table public.cars add column if not exists found_note  text;     -- jak jsme vůz našli
alter table public.cars add column if not exists problems    jsonb default '[]'::jsonb;  -- co bylo špatně (pole textů)
alter table public.cars add column if not exists work        jsonb default '[]'::jsonb;  -- co jsme udělali (pole textů)
alter table public.cars add column if not exists story       text;     -- shrnutí / příběh flipu
