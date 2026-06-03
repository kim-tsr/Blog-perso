-- dev.sec.ops — Drafts + scheduled publishing pour labs et projects
-- Ajoute un champ scheduled_for : si renseigné, le contenu apparaît public
-- automatiquement quand scheduled_for <= now() même si published = false.

-- ───────────────────────────────────────────────────────
-- 1. Champ scheduled_for sur labs et projects
-- ───────────────────────────────────────────────────────
alter table public.labs
  add column if not exists scheduled_for timestamptz;

alter table public.projects
  add column if not exists scheduled_for timestamptz;

create index if not exists labs_scheduled_idx
  on public.labs(scheduled_for)
  where scheduled_for is not null and published = false;

create index if not exists projects_scheduled_idx
  on public.projects(scheduled_for)
  where scheduled_for is not null and published = false;

-- ───────────────────────────────────────────────────────
-- 2. Vues "publiées effectives" (utilisées par les loaders publics)
--    Une ligne est visible quand :
--      - published = true, OU
--      - scheduled_for is not null ET scheduled_for <= now()
-- ───────────────────────────────────────────────────────
create or replace view public.labs_public
with (security_invoker = true)
as
select *
from public.labs
where published = true
   or (scheduled_for is not null and scheduled_for <= now());

grant select on public.labs_public to anon, authenticated;

create or replace view public.projects_public
with (security_invoker = true)
as
select *
from public.projects
where published = true
   or (scheduled_for is not null and scheduled_for <= now());

grant select on public.projects_public to anon, authenticated;
