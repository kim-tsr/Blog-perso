-- dev.sec.ops — Persistance des tentatives de quiz
-- À exécuter dans Supabase SQL Editor APRÈS 011_linux_hardening_series.sql

-- ───────────────────────────────────────────────────────
-- 1. Table quiz_attempts
-- ───────────────────────────────────────────────────────
create table if not exists public.quiz_attempts (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lab_slug     text not null,
  score        int  not null check (score >= 0),
  max_score    int  not null check (max_score > 0),
  passed       boolean not null,
  created_at   timestamptz not null default now()
);

create index if not exists quiz_attempts_user_idx     on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_user_lab_idx on public.quiz_attempts(user_id, lab_slug);

alter table public.quiz_attempts enable row level security;

drop policy if exists "quiz_attempts_own_select" on public.quiz_attempts;
create policy "quiz_attempts_own_select"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

-- Inserts via RPC SECURITY DEFINER uniquement — pas d'INSERT direct.

-- ───────────────────────────────────────────────────────
-- 2. RPC : submit_quiz_attempt
-- ───────────────────────────────────────────────────────
create or replace function public.submit_quiz_attempt(
  p_slug      text,
  p_score     int,
  p_max_score int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_pass  boolean;
  v_best  int;
  v_first boolean;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_max_score <= 0 or p_score < 0 or p_score > p_max_score then
    return jsonb_build_object('ok', false, 'error', 'invalid_score');
  end if;

  v_pass := (p_score = p_max_score);

  select not exists(select 1 from public.quiz_attempts where user_id = v_user and lab_slug = p_slug)
    into v_first;

  insert into public.quiz_attempts (user_id, lab_slug, score, max_score, passed)
  values (v_user, p_slug, p_score, p_max_score, v_pass);

  select max(score) into v_best
  from public.quiz_attempts
  where user_id = v_user and lab_slug = p_slug;

  return jsonb_build_object(
    'ok',          true,
    'passed',      v_pass,
    'best_score',  v_best,
    'first_try',   v_first
  );
end;
$$;

revoke all on function public.submit_quiz_attempt(text, int, int) from public;
grant execute on function public.submit_quiz_attempt(text, int, int) to authenticated;

-- ───────────────────────────────────────────────────────
-- 3. Vue : quiz_best_scores (meilleur score par lab + first-try perfect)
-- ───────────────────────────────────────────────────────
create or replace view public.quiz_best_scores
with (security_invoker = true)
as
with ranked as (
  select
    user_id,
    lab_slug,
    score,
    max_score,
    passed,
    created_at,
    row_number() over (partition by user_id, lab_slug order by created_at asc) as rn
  from public.quiz_attempts
)
select
  user_id,
  lab_slug,
  max(score)              as best_score,
  max(max_score)          as max_score,
  bool_or(passed)         as ever_passed,
  count(*)                as attempts,
  bool_or(rn = 1 and score = max_score) as first_try_perfect
from ranked
group by user_id, lab_slug;

grant select on public.quiz_best_scores to authenticated;
