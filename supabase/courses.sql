-- ============================================================
--  FlipujKáru — Mé materiály: kurzy Akademie + pokrok členů
--  Spustíš v Supabase: SQL Editor → New query → vlož → RUN.
--  Bezpečné pustit i opakovaně (if not exists / drop + create policy).
--  Obsah kurzů se nahrává zvlášť: supabase/courses_seed.sql
--  (generuje ho `node scripts/build-courses-sql.mjs` z data/courses/courses.js;
--  obojí je v .gitignore — repo je veřejné a obsah je jen pro členy).
-- ============================================================

-- Má přihlášený uživatel přístup k členským materiálům?
-- (aktivní členství — stejná podmínka jako AppContext.loadMembership — nebo admin)
create or replace function public.has_course_access()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or (p.plan is not null and p.subscription_status = 'active'))
  );
$$;

revoke execute on function public.has_course_access() from public, anon;
grant execute on function public.has_course_access() to authenticated;

-- Kurzy: název, popis a osnova (seznam lekcí bez obsahu) — vidí každý
-- přihlášený, aby i nečlen viděl, co se v Akademii odemkne.
create table if not exists public.courses (
  id text primary key,
  sort int not null default 0,
  title text not null,
  subtitle text,
  outline jsonb not null default '[]'::jsonb, -- [{ id, title, minutes }]
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "courses_select_authenticated" on public.courses;
create policy "courses_select_authenticated" on public.courses
  for select to authenticated using (true);

-- Lekce s obsahem — jen pro členy (a adminy)
create table if not exists public.course_lessons (
  course_id text not null references public.courses (id) on delete cascade,
  id text not null,
  sort int not null default 0,
  title text not null,
  minutes int not null default 1,
  content jsonb not null default '[]'::jsonb, -- bloky, viz data/courses/courses.js
  primary key (course_id, id)
);

alter table public.course_lessons enable row level security;

drop policy if exists "course_lessons_select_members" on public.course_lessons;
create policy "course_lessons_select_members" on public.course_lessons
  for select to authenticated using (public.has_course_access());

-- Pokrok: jeden řádek = jedna dokončená lekce daného uživatele
create table if not exists public.course_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id),
  foreign key (course_id, lesson_id) references public.course_lessons (course_id, id) on delete cascade
);

alter table public.course_progress enable row level security;

drop policy if exists "course_progress_select_own" on public.course_progress;
create policy "course_progress_select_own" on public.course_progress
  for select using (auth.uid() = user_id);

drop policy if exists "course_progress_insert_own" on public.course_progress;
create policy "course_progress_insert_own" on public.course_progress
  for insert with check (auth.uid() = user_id and public.has_course_access());

drop policy if exists "course_progress_delete_own" on public.course_progress;
create policy "course_progress_delete_own" on public.course_progress
  for delete using (auth.uid() = user_id);
