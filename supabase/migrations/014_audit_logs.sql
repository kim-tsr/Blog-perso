-- dev.sec.ops — Audit log des actions admin
-- Append-only : insert via RPC, lecture admin-only.

-- ───────────────────────────────────────────────────────
-- 1. Table audit_logs
-- ───────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id           bigint generated always as identity primary key,
  actor_id     uuid references auth.users(id) on delete set null,
  actor_email  text,
  action       text not null,
  target_type  text,
  target_id    text,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx      on public.audit_logs(actor_id);
create index if not exists audit_logs_target_idx     on public.audit_logs(target_type, target_id);

alter table public.audit_logs enable row level security;

-- Lecture admin uniquement
drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Pas d'insert/update/delete direct — uniquement via RPC SECURITY DEFINER.

-- ───────────────────────────────────────────────────────
-- 2. RPC : log_admin_action
-- ───────────────────────────────────────────────────────
create or replace function public.log_admin_action(
  p_action      text,
  p_target_type text default null,
  p_target_id   text default null,
  p_payload     jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_email   text;
  v_isadmin boolean;
begin
  if v_user is null then return; end if;

  select (role = 'admin'), email into v_isadmin, v_email
  from public.profiles
  where id = v_user;

  if not coalesce(v_isadmin, false) then return; end if;

  insert into public.audit_logs (actor_id, actor_email, action, target_type, target_id, payload)
  values (v_user, v_email, p_action, p_target_type, p_target_id, coalesce(p_payload, '{}'::jsonb));
end;
$$;

revoke all on function public.log_admin_action(text, text, text, jsonb) from public;
grant execute on function public.log_admin_action(text, text, text, jsonb) to authenticated;
