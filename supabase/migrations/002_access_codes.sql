-- dev.sec.ops — Codes d'accès (invite codes) pour upgrade de rôle
-- À exécuter dans Supabase SQL Editor APRÈS 001_profiles.sql

-- ───────────────────────────────────────────────────────
-- 1. Tables
-- ───────────────────────────────────────────────────────
create table if not exists public.access_codes (
  code         text primary key,
  grants_role  public.user_role not null,
  description  text,
  max_uses     integer,                       -- null = illimité
  uses_count   integer not null default 0,
  expires_at   timestamptz,                   -- null = jamais
  disabled     boolean not null default false,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

comment on table public.access_codes is 'Codes générés par les admins pour octroyer un rôle aux utilisateurs.';

create table if not exists public.code_redemptions (
  id             uuid primary key default gen_random_uuid(),
  code           text not null references public.access_codes(code) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  previous_role  public.user_role not null,
  granted_role   public.user_role not null,
  redeemed_at    timestamptz not null default now(),
  unique (code, user_id)
);

create index if not exists code_redemptions_user_idx on public.code_redemptions(user_id);
create index if not exists code_redemptions_code_idx on public.code_redemptions(code);

-- ───────────────────────────────────────────────────────
-- 2. Row Level Security
-- ───────────────────────────────────────────────────────
alter table public.access_codes enable row level security;
alter table public.code_redemptions enable row level security;

-- Seuls les admins gèrent les codes (lecture + écriture)
drop policy if exists "access_codes_admin_all" on public.access_codes;
create policy "access_codes_admin_all"
  on public.access_codes for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- L'utilisateur voit ses propres redemptions, l'admin voit tout
drop policy if exists "redemptions_select" on public.code_redemptions;
create policy "redemptions_select"
  on public.code_redemptions for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Personne ne peut insérer directement (la RPC le fait via SECURITY DEFINER)
-- Pas de policy INSERT/UPDATE/DELETE → tout est bloqué par défaut avec RLS ON.
-- Les admins peuvent toutefois supprimer des redemptions pour le ménage :
drop policy if exists "redemptions_admin_delete" on public.code_redemptions;
create policy "redemptions_admin_delete"
  on public.code_redemptions for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ───────────────────────────────────────────────────────
-- 3. RPC : redeem_access_code(p_code)
-- Atomique, security definer pour bypasser les RLS de profiles.
-- ───────────────────────────────────────────────────────
create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id          uuid := auth.uid();
  v_code             public.access_codes%rowtype;
  v_profile          public.profiles%rowtype;
  v_already_redeemed boolean;
  v_normalized       text := upper(trim(p_code));
  v_rank             constant jsonb := '{"free":0,"pro":1,"admin":2}'::jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if v_normalized is null or length(v_normalized) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_code');
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'profile_missing');
  end if;

  -- Lock pour éviter les courses sur max_uses
  select * into v_code from public.access_codes where code = v_normalized for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_code.disabled then
    return jsonb_build_object('ok', false, 'error', 'disabled');
  end if;

  if v_code.expires_at is not null and v_code.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if v_code.max_uses is not null and v_code.uses_count >= v_code.max_uses then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  select exists(
    select 1 from public.code_redemptions where code = v_code.code and user_id = v_user_id
  ) into v_already_redeemed;
  if v_already_redeemed then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  -- Promotion uniquement si le rôle octroyé est strictement supérieur
  if (v_rank->>(v_code.grants_role::text))::int >
     (v_rank->>(v_profile.role::text)::text)::int then
    update public.profiles set role = v_code.grants_role where id = v_user_id;
  end if;

  insert into public.code_redemptions (code, user_id, previous_role, granted_role)
  values (v_code.code, v_user_id, v_profile.role, v_code.grants_role);

  update public.access_codes set uses_count = uses_count + 1 where code = v_code.code;

  return jsonb_build_object(
    'ok', true,
    'previous_role', v_profile.role,
    'granted_role',  v_code.grants_role
  );
end;
$$;

revoke all on function public.redeem_access_code(text) from public;
grant execute on function public.redeem_access_code(text) to authenticated;

-- ───────────────────────────────────────────────────────
-- 4. Vue pratique pour l'admin (codes + nb de redemptions)
-- ───────────────────────────────────────────────────────
create or replace view public.access_codes_with_stats as
select
  c.*,
  (select count(*) from public.code_redemptions r where r.code = c.code) as redeemed_count
from public.access_codes c;

-- La vue hérite des RLS de la table sous-jacente (admin-only).
