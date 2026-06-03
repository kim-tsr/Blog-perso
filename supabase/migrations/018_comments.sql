-- dev.sec.ops — Système de commentaires sur les labs
-- À exécuter dans Supabase SQL Editor APRÈS 017_newsletter.sql

-- ───────────────────────────────────────────────────────
-- 1. Table comments
-- ───────────────────────────────────────────────────────
create table if not exists public.comments (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  lab_slug   text not null,
  body       text not null check (char_length(body) between 1 and 4000),
  status     text not null default 'visible' check (status in ('visible','hidden','flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_lab_slug_idx on public.comments(lab_slug, created_at desc);
create index if not exists comments_user_idx     on public.comments(user_id);

alter table public.comments enable row level security;

-- SELECT public : seuls les commentaires visibles (anon + auth)
drop policy if exists "comments_public_select" on public.comments;
create policy "comments_public_select"
  on public.comments for select
  using (status = 'visible');

-- SELECT admin : tous les statuts via is_admin() (non-récursif)
drop policy if exists "comments_admin_select" on public.comments;
create policy "comments_admin_select"
  on public.comments for select
  using (public.is_admin());

-- ALL admin : insert/update/delete
drop policy if exists "comments_admin_all" on public.comments;
create policy "comments_admin_all"
  on public.comments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Pas de INSERT/UPDATE/DELETE direct pour les non-admin — tout passe par RPC.

-- ───────────────────────────────────────────────────────
-- 2. RPC : submit_comment
-- ───────────────────────────────────────────────────────
create or replace function public.submit_comment(
  p_slug text,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_body text;
  v_id   bigint;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  v_body := trim(p_body);

  if char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_body');
  end if;

  if char_length(v_body) > 4000 then
    return jsonb_build_object('ok', false, 'error', 'body_too_long');
  end if;

  -- Rate limit : 1 commentaire toutes les 30 secondes par user
  if exists(
    select 1 from public.comments
    where user_id = v_user
      and created_at > now() - interval '30 seconds'
  ) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  insert into public.comments (user_id, lab_slug, body)
  values (v_user, p_slug, v_body)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.submit_comment(text, text) from public;
grant execute on function public.submit_comment(text, text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 3. RPC : edit_comment
-- ───────────────────────────────────────────────────────
create or replace function public.edit_comment(
  p_id   bigint,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_body text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  v_body := trim(p_body);

  if char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_body');
  end if;

  if char_length(v_body) > 4000 then
    return jsonb_build_object('ok', false, 'error', 'body_too_long');
  end if;

  update public.comments
  set body = v_body, updated_at = now()
  where id = p_id and user_id = v_user;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found_or_not_owner');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.edit_comment(bigint, text) from public;
grant execute on function public.edit_comment(bigint, text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 4. RPC : delete_comment (propriétaire seulement)
-- ───────────────────────────────────────────────────────
create or replace function public.delete_comment(
  p_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  delete from public.comments
  where id = p_id and user_id = v_user;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found_or_not_owner');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.delete_comment(bigint) from public;
grant execute on function public.delete_comment(bigint) to authenticated;

-- ───────────────────────────────────────────────────────
-- 5. RPC : moderate_comment (admin seulement)
-- ───────────────────────────────────────────────────────
create or replace function public.moderate_comment(
  p_id     bigint,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_status not in ('visible','hidden','flagged') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  update public.comments
  set status = p_status, updated_at = now()
  where id = p_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.moderate_comment(bigint, text) from public;
grant execute on function public.moderate_comment(bigint, text) to authenticated;
