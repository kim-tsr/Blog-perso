-- dev.sec.ops — Fix : récursion RLS sur les policies admin
-- À exécuter dans Supabase SQL Editor APRÈS 004_self_heal_profile.sql
--
-- Problème : les policies "admin_all" font une sous-requête sur la même
-- table sur laquelle elles s'appliquent, ce qui peut bloquer silencieusement
-- toutes les lectures (Postgres ne réévalue pas une policy en pleine évaluation,
-- donc la sous-requête retourne 0 ligne → exists = false → accès refusé).
--
-- Solution : extraire la vérification dans une fonction security definer
-- qui contourne la RLS pour cette lecture interne.

-- ───────────────────────────────────────────────────────
-- 1. Fonction helper : suis-je admin ?
-- ───────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

comment on function public.is_admin() is
  'Renvoie true si l''utilisateur authentifié a le rôle admin. SECURITY DEFINER pour éviter la récursion RLS sur public.profiles.';

-- ───────────────────────────────────────────────────────
-- 2. Profiles — policies recréées sans récursion
-- ───────────────────────────────────────────────────────
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Note : profiles_select_own, profiles_update_own et profiles_insert_own
-- restent en place — elles ne font pas de sous-requête, donc OK.

-- ───────────────────────────────────────────────────────
-- 3. Access codes — même fix
-- ───────────────────────────────────────────────────────
drop policy if exists "access_codes_admin_all" on public.access_codes;
create policy "access_codes_admin_all"
  on public.access_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ───────────────────────────────────────────────────────
-- 4. Code redemptions — même fix
-- ───────────────────────────────────────────────────────
drop policy if exists "redemptions_select" on public.code_redemptions;
create policy "redemptions_select"
  on public.code_redemptions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "redemptions_admin_delete" on public.code_redemptions;
create policy "redemptions_admin_delete"
  on public.code_redemptions for delete
  using (public.is_admin());

-- ───────────────────────────────────────────────────────
-- 5. Sanity check (exécuter pour vérifier — doit retourner ton rôle)
-- ───────────────────────────────────────────────────────
-- set role authenticated;
-- select id, email, role from public.profiles where id = auth.uid();
-- reset role;
