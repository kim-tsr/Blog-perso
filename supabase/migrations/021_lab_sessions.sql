-- dev.sec.ops — Lab sandbox éphémère (k3s)
-- À exécuter dans Supabase SQL Editor APRÈS 020_systemes_category.sql
--
-- Phase 1 : admin only. Limite stricte 1 session active par user.
-- Le pod k8s est créé/détruit côté Next.js via `lib/k8s.ts`. Cette table
-- garde l'état autoritatif des sessions pour billing/audit/garbage collect.

-- ───────────────────────────────────────────────────────
-- 1. Table lab_sessions
-- ───────────────────────────────────────────────────────
create table if not exists public.lab_sessions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  lab_slug      text        not null,
  k8s_pod_name  text,
  k8s_namespace text        not null default 'devsecops-labs',
  status        text        not null default 'pending' check (status in (
                              'pending','running','expired','killed','crashed'
                            )),
  started_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  ended_at      timestamptz,
  exit_reason   text
);

create index if not exists lab_sessions_user_active_idx
  on public.lab_sessions(user_id) where ended_at is null;
create index if not exists lab_sessions_expires_idx
  on public.lab_sessions(expires_at) where ended_at is null;
create index if not exists lab_sessions_pod_idx
  on public.lab_sessions(k8s_pod_name) where k8s_pod_name is not null;

alter table public.lab_sessions enable row level security;

-- SELECT owner-only
drop policy if exists "lab_sessions_owner_select" on public.lab_sessions;
create policy "lab_sessions_owner_select"
  on public.lab_sessions for select
  using (user_id = auth.uid());

-- SELECT admin : toutes les sessions
drop policy if exists "lab_sessions_admin_select" on public.lab_sessions;
create policy "lab_sessions_admin_select"
  on public.lab_sessions for select
  using (public.is_admin());

-- ALL admin : pour debug / kill manuel
drop policy if exists "lab_sessions_admin_all" on public.lab_sessions;
create policy "lab_sessions_admin_all"
  on public.lab_sessions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ───────────────────────────────────────────────────────
-- 2. RPC : start_lab_session
-- ───────────────────────────────────────────────────────
-- Admin-only au début. Refuse si une session active existe déjà.
-- Retourne {ok, session_id, expires_at} ou {ok:false, error}.
create or replace function public.start_lab_session(
  p_slug        text,
  p_pod_name    text,
  p_ttl_seconds integer default 1800
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id   uuid;
  v_exp  timestamptz;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_ttl_seconds < 60 or p_ttl_seconds > 3600 then
    return jsonb_build_object('ok', false, 'error', 'invalid_ttl');
  end if;

  -- Refuser si session active existante (non terminée ET non expirée)
  if exists(
    select 1 from public.lab_sessions
    where user_id = v_user
      and ended_at is null
      and expires_at > now()
  ) then
    return jsonb_build_object('ok', false, 'error', 'session_active');
  end if;

  v_exp := now() + make_interval(secs => p_ttl_seconds);

  insert into public.lab_sessions (user_id, lab_slug, k8s_pod_name, status, expires_at)
  values (v_user, p_slug, p_pod_name, 'running', v_exp)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'session_id', v_id, 'expires_at', v_exp);
end;
$$;

revoke all on function public.start_lab_session(text, text, integer) from public;
grant execute on function public.start_lab_session(text, text, integer) to authenticated;

-- ───────────────────────────────────────────────────────
-- 3. RPC : end_lab_session
-- ───────────────────────────────────────────────────────
-- L'owner OU un admin peut terminer. Idempotent.
create or replace function public.end_lab_session(
  p_id     uuid,
  p_reason text default 'user_ended'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select user_id into v_owner
  from public.lab_sessions
  where id = p_id;

  if v_owner is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_owner <> v_user and not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  update public.lab_sessions
  set ended_at    = coalesce(ended_at, now()),
      exit_reason = coalesce(exit_reason, p_reason),
      status      = case
                      when status in ('running','pending') then
                        case p_reason
                          when 'expired'  then 'expired'
                          when 'crashed'  then 'crashed'
                          when 'admin_kill' then 'killed'
                          else 'killed'
                        end
                      else status
                    end
  where id = p_id;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.end_lab_session(uuid, text) from public;
grant execute on function public.end_lab_session(uuid, text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 4. RPC : get_active_session (helper UI)
-- ───────────────────────────────────────────────────────
create or replace function public.get_active_session()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.lab_sessions%rowtype;
begin
  if v_user is null then
    return jsonb_build_object('ok', true, 'session', null);
  end if;

  select * into v_row
  from public.lab_sessions
  where user_id = v_user
    and ended_at is null
    and expires_at > now()
  order by started_at desc
  limit 1;

  if not found then
    return jsonb_build_object('ok', true, 'session', null);
  end if;

  return jsonb_build_object(
    'ok', true,
    'session', jsonb_build_object(
      'id', v_row.id,
      'lab_slug', v_row.lab_slug,
      'pod_name', v_row.k8s_pod_name,
      'expires_at', v_row.expires_at,
      'status', v_row.status
    )
  );
end;
$$;

revoke all on function public.get_active_session() from public;
grant execute on function public.get_active_session() to authenticated;

-- ───────────────────────────────────────────────────────
-- 5. Cron : marquer les sessions expirées
-- ───────────────────────────────────────────────────────
-- Si la session passe la deadline sans que le client ait POST /end,
-- on la marque comme 'expired'. Le garbage collect réel des pods est
-- géré par activeDeadlineSeconds côté k8s (defense in depth).
do $$
begin
  if exists(select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'lab_sessions_expire',
      '*/2 * * * *',
      $cron$
        update public.lab_sessions
        set ended_at    = now(),
            status      = 'expired',
            exit_reason = coalesce(exit_reason, 'ttl_reached')
        where ended_at is null
          and expires_at <= now();
      $cron$
    );
  end if;
end$$;
