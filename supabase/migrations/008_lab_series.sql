-- dev.sec.ops — Séries de labs chaînés
-- À exécuter dans Supabase SQL Editor APRÈS 007_user_progress.sql

-- ───────────────────────────────────────────────────────
-- 1. Table des séries (parcours pédagogique)
-- ───────────────────────────────────────────────────────
create table if not exists public.lab_series (
  slug          text primary key,
  title         text not null,
  description   text,
  theme         text not null check (theme in ('violet','cyan','amber')),
  created_at    timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────
-- 2. Lien labs ↔ série + ordre dans la série
-- ───────────────────────────────────────────────────────
alter table public.labs add column if not exists series_slug text references public.lab_series(slug) on delete set null;
alter table public.labs add column if not exists series_order integer;

create index if not exists labs_series_idx on public.labs(series_slug, series_order);

-- ───────────────────────────────────────────────────────
-- 3. RLS
-- ───────────────────────────────────────────────────────
alter table public.lab_series enable row level security;

drop policy if exists "lab_series_read" on public.lab_series;
create policy "lab_series_read"
  on public.lab_series for select
  using (true);

drop policy if exists "lab_series_admin" on public.lab_series;
create policy "lab_series_admin"
  on public.lab_series for all
  using (public.is_admin())
  with check (public.is_admin());

-- ───────────────────────────────────────────────────────
-- 4. Seed : série "Homelab from zero"
-- ───────────────────────────────────────────────────────
insert into public.lab_series (slug, title, description, theme)
values
  ('homelab-from-zero',
   'Homelab from zero',
   'Cinq labs qui construisent et durcissent progressivement un homelab complet : virtualisation, orchestration, GitOps, observabilité, sécurité runtime.',
   'violet')
on conflict (slug) do nothing;
