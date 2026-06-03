-- dev.sec.ops — Admin user management
-- RPC SECURITY DEFINER pour changer le rôle d'un user sans toucher aux RLS profiles.

-- ───────────────────────────────────────────────────────
-- 1. RPC : admin_set_user_role
-- ───────────────────────────────────────────────────────
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role    text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller  uuid := auth.uid();
  v_isadmin boolean;
begin
  if v_caller is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select (role = 'admin') into v_isadmin
  from public.profiles
  where id = v_caller;

  if not coalesce(v_isadmin, false) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_role not in ('free', 'pro', 'admin') then
    return jsonb_build_object('ok', false, 'error', 'invalid_role');
  end if;

  if p_user_id = v_caller and p_role <> 'admin' then
    return jsonb_build_object('ok', false, 'error', 'cannot_self_demote');
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  return jsonb_build_object('ok', true, 'role', p_role);
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 2. Vue : admin_users_overview (liste + stats par user)
-- Visible uniquement aux admins via RLS check côté vue (security_invoker).
-- ───────────────────────────────────────────────────────
create or replace view public.admin_users_overview
with (security_invoker = true)
as
select
  p.id,
  p.email,
  p.name,
  p.role,
  p.created_at,
  coalesce(lp.labs_completed, 0)::int as labs_completed,
  coalesce(lp.labs_started,   0)::int as labs_started,
  coalesce(bm.bookmarks_count, 0)::int as bookmarks_count,
  coalesce(rd.codes_redeemed, 0)::int as codes_redeemed
from public.profiles p
left join (
  select user_id,
    count(*) filter (where status = 'completed') as labs_completed,
    count(*) filter (where status = 'started')   as labs_started
  from public.lab_progress
  group by user_id
) lp on lp.user_id = p.id
left join (
  select user_id, count(*) as bookmarks_count
  from public.bookmarks
  group by user_id
) bm on bm.user_id = p.id
left join (
  select user_id, count(*) as codes_redeemed
  from public.code_redemptions
  group by user_id
) rd on rd.user_id = p.id
-- Filtre admin-only : avec security_invoker, le viewer voit ses propres profils;
-- les admins voient tout grâce à la policy "profiles_admin_all" qui existe déjà.
;

grant select on public.admin_users_overview to authenticated;
