-- ============================================================
--  FlipujKáru — Moje flipy: výběr z návrhů algoritmu (algdash)
--  Flip se zakládá z nálezu v /api/undervalued, ne z našich aut
--  v nabídce. Uložíme si ID nálezu a odkaz na inzerát, ať flip
--  zůstane dohledatelný, i když nález z algoritmu zmizí.
--  Bezpečné pustit opakovaně (add column if not exists).
-- ============================================================

alter table public.user_flips add column if not exists deal_external_id text;  -- external_id z algdash
alter table public.user_flips add column if not exists deal_source_url  text;  -- odkaz na původní inzerát
alter table public.user_flips add column if not exists year             integer;
