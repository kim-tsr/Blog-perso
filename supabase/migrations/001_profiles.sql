-- dev.sec.ops — Schema initial : profils utilisateurs et rôles
-- À exécuter dans Supabase SQL Editor

-- ───────────────────────────────────────────────────────
-- 1. Enum des rôles
-- ───────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('free', 'pro', 'admin');
exception when duplicate_object then null;
end $$;

-- ───────────────────────────────────────────────────────
-- 2. Table profiles (1-1 avec auth.users)
-- ───────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text,
  avatar_url  text,
  role        public.user_role not null default 'free',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Profil étendu de auth.users. La colonne role contrôle l''accès au contenu gated.';

-- ───────────────────────────────────────────────────────
-- 3. Trigger : créer un profil à chaque nouvel utilisateur
-- ───────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────
-- 4. Trigger : maintenir updated_at
-- ───────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ───────────────────────────────────────────────────────
-- 5. Row Level Security
-- ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Un utilisateur peut lire son propre profil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Un utilisateur peut mettre à jour son nom/avatar, JAMAIS son rôle.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Les admins peuvent tout lire et mettre à jour.
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ───────────────────────────────────────────────────────
-- 6. (Optionnel) Table pour suivre la progression
-- ───────────────────────────────────────────────────────
create table if not exists public.lab_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lab_slug     text not null,
  completed_at timestamptz,
  notes        text,
  primary key (user_id, lab_slug)
);

alter table public.lab_progress enable row level security;

drop policy if exists "lab_progress_own" on public.lab_progress;
create policy "lab_progress_own"
  on public.lab_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────
-- 7. Pour te promouvoir admin après ta première connexion :
-- ───────────────────────────────────────────────────────
-- update public.profiles set role = 'admin' where email = 'kim.tessier07@gmail.com';
