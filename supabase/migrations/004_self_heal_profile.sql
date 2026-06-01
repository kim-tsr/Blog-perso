-- dev.sec.ops — Auto-réparation des profils manquants
-- À exécuter dans Supabase SQL Editor APRÈS 003_secure_view.sql

-- ───────────────────────────────────────────────────────
-- 1. Backfill : créer les profils manquants pour les users
--    déjà inscrits (par exemple inscrits avant le trigger).
-- ───────────────────────────────────────────────────────
insert into public.profiles (id, email, name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- ───────────────────────────────────────────────────────
-- 2. RLS : autoriser un user à créer son propre profil
--    (utile si le trigger échoue ou est désactivé temporairement)
-- ───────────────────────────────────────────────────────
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role = 'free'  -- on ne peut jamais s'auto-promouvoir
  );

-- ───────────────────────────────────────────────────────
-- 3. (Facultatif) Vérifie l'état après la migration
-- ───────────────────────────────────────────────────────
-- select count(*) from auth.users;
-- select count(*) from public.profiles;
-- → Les deux doivent être égaux.
