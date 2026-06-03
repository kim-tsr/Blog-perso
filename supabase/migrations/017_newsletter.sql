-- dev.sec.ops — Newsletter (collecte email avec double opt-in)
-- L'inscription se fait via /api/newsletter/subscribe → magic link Supabase Auth.
-- Le clic sur le lien dans l'email appelle /api/newsletter/confirm avec un token.

-- ───────────────────────────────────────────────────────
-- 1. Table newsletter_subscribers
-- ───────────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  email          text primary key,
  confirm_token  text not null unique,
  confirmed_at   timestamptz,
  unsubscribed_at timestamptz,
  source_page    text,
  created_at     timestamptz not null default now()
);

create index if not exists newsletter_confirmed_idx
  on public.newsletter_subscribers(confirmed_at)
  where confirmed_at is not null and unsubscribed_at is null;

alter table public.newsletter_subscribers enable row level security;

-- Lecture : admin uniquement
drop policy if exists "newsletter_admin_select" on public.newsletter_subscribers;
create policy "newsletter_admin_select"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Pas d'écriture directe — RPCs uniquement.

-- ───────────────────────────────────────────────────────
-- 2. RPC : newsletter_subscribe (génère un token de confirmation)
-- ───────────────────────────────────────────────────────
create or replace function public.newsletter_subscribe(
  p_email       text,
  p_source_page text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_token text;
  v_existing public.newsletter_subscribers%rowtype;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;

  select * into v_existing from public.newsletter_subscribers where email = v_email;

  if found and v_existing.confirmed_at is not null and v_existing.unsubscribed_at is null then
    return jsonb_build_object('ok', true, 'state', 'already_confirmed');
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  if found then
    update public.newsletter_subscribers
       set confirm_token = v_token,
           unsubscribed_at = null,
           source_page = coalesce(p_source_page, source_page)
     where email = v_email;
  else
    insert into public.newsletter_subscribers (email, confirm_token, source_page)
    values (v_email, v_token, p_source_page);
  end if;

  return jsonb_build_object('ok', true, 'state', 'pending', 'token', v_token);
end;
$$;

revoke all on function public.newsletter_subscribe(text, text) from public;
grant execute on function public.newsletter_subscribe(text, text) to anon, authenticated;

-- ───────────────────────────────────────────────────────
-- 3. RPC : newsletter_confirm (valide le token)
-- ───────────────────────────────────────────────────────
create or replace function public.newsletter_confirm(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if p_token is null or length(p_token) < 32 then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select email into v_email
  from public.newsletter_subscribers
  where confirm_token = p_token;

  if v_email is null then
    return jsonb_build_object('ok', false, 'error', 'token_not_found');
  end if;

  update public.newsletter_subscribers
     set confirmed_at = coalesce(confirmed_at, now()),
         unsubscribed_at = null
   where email = v_email;

  return jsonb_build_object('ok', true, 'email', v_email);
end;
$$;

revoke all on function public.newsletter_confirm(text) from public;
grant execute on function public.newsletter_confirm(text) to anon, authenticated;

-- ───────────────────────────────────────────────────────
-- 4. RPC : newsletter_unsubscribe
-- ───────────────────────────────────────────────────────
create or replace function public.newsletter_unsubscribe(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  update public.newsletter_subscribers
     set unsubscribed_at = now()
   where confirm_token = p_token;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'token_not_found');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.newsletter_unsubscribe(text) from public;
grant execute on function public.newsletter_unsubscribe(text) to anon, authenticated;
