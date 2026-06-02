-- dev.sec.ops — Tracking de la progression utilisateur
-- À exécuter dans Supabase SQL Editor APRÈS 006_content_tables.sql

-- ───────────────────────────────────────────────────────
-- 1. Articles lus
-- ───────────────────────────────────────────────────────
create table if not exists public.article_reads (
  user_id      uuid not null references auth.users(id) on delete cascade,
  article_slug text not null,
  read_at      timestamptz not null default now(),
  primary key (user_id, article_slug)
);

create index if not exists article_reads_user_idx on public.article_reads(user_id);

alter table public.article_reads enable row level security;

drop policy if exists "article_reads_own" on public.article_reads;
create policy "article_reads_own"
  on public.article_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────
-- 2. Labs : on étend la table lab_progress (créée en 001) — pas besoin de recréer
--    On ajoute un statut clair started / completed et on rend les colonnes opt.
-- ───────────────────────────────────────────────────────
alter table public.lab_progress add column if not exists status text;
alter table public.lab_progress add column if not exists started_at timestamptz default now();
update public.lab_progress set status = case when completed_at is not null then 'completed' else 'started' end where status is null;
alter table public.lab_progress alter column status set default 'started';
alter table public.lab_progress alter column status set not null;

-- ───────────────────────────────────────────────────────
-- 3. RPC : mark_article_read
-- ───────────────────────────────────────────────────────
create or replace function public.mark_article_read(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.article_reads (user_id, article_slug)
  values (auth.uid(), p_slug)
  on conflict (user_id, article_slug) do update set read_at = excluded.read_at;
end;
$$;

revoke all on function public.mark_article_read(text) from public;
grant execute on function public.mark_article_read(text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 4. RPC : toggle_lab_completion (bascule started ↔ completed)
-- ───────────────────────────────────────────────────────
create or replace function public.toggle_lab_completion(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing public.lab_progress%rowtype;
  v_new_status text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_existing from public.lab_progress where user_id = v_user and lab_slug = p_slug;

  if not found then
    insert into public.lab_progress (user_id, lab_slug, status, started_at, completed_at)
    values (v_user, p_slug, 'completed', now(), now());
    v_new_status := 'completed';
  elsif v_existing.status = 'completed' then
    update public.lab_progress
       set status = 'started', completed_at = null
     where user_id = v_user and lab_slug = p_slug;
    v_new_status := 'started';
  else
    update public.lab_progress
       set status = 'completed', completed_at = now()
     where user_id = v_user and lab_slug = p_slug;
    v_new_status := 'completed';
  end if;

  return jsonb_build_object('ok', true, 'status', v_new_status);
end;
$$;

revoke all on function public.toggle_lab_completion(text) from public;
grant execute on function public.toggle_lab_completion(text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 5. Vue agrégée de la progression
-- ───────────────────────────────────────────────────────
create or replace view public.user_progress_summary
with (security_invoker = on)
as
select
  u.id as user_id,
  (select count(*) from public.article_reads ar where ar.user_id = u.id) as articles_read,
  (select count(*) from public.lab_progress lp where lp.user_id = u.id and lp.status = 'started')   as labs_started,
  (select count(*) from public.lab_progress lp where lp.user_id = u.id and lp.status = 'completed') as labs_completed
from auth.users u;

comment on view public.user_progress_summary is 'Compteurs de progression par utilisateur (RLS via security_invoker → un user voit ses propres compteurs).';
