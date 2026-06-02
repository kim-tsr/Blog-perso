-- dev.sec.ops — Bookmarks (favoris) sur articles et labs
-- À exécuter dans Supabase SQL Editor APRÈS 009_api_series.sql

-- ───────────────────────────────────────────────────────
-- 1. Table bookmarks
-- ───────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  user_id        uuid not null references auth.users(id) on delete cascade,
  content_type   text not null check (content_type in ('article', 'lab')),
  content_slug   text not null,
  created_at     timestamptz not null default now(),
  primary key (user_id, content_type, content_slug)
);

create index if not exists bookmarks_user_idx on public.bookmarks(user_id);
create index if not exists bookmarks_lookup_idx on public.bookmarks(user_id, content_type);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_own" on public.bookmarks;
create policy "bookmarks_own"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────
-- 2. RPC : toggle_bookmark
-- ───────────────────────────────────────────────────────
create or replace function public.toggle_bookmark(p_type text, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_exists boolean;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_type not in ('article', 'lab') then
    return jsonb_build_object('ok', false, 'error', 'invalid_type');
  end if;

  select exists(
    select 1 from public.bookmarks
    where user_id = v_user and content_type = p_type and content_slug = p_slug
  ) into v_exists;

  if v_exists then
    delete from public.bookmarks
    where user_id = v_user and content_type = p_type and content_slug = p_slug;
    return jsonb_build_object('ok', true, 'bookmarked', false);
  else
    insert into public.bookmarks (user_id, content_type, content_slug)
    values (v_user, p_type, p_slug);
    return jsonb_build_object('ok', true, 'bookmarked', true);
  end if;
end;
$$;

revoke all on function public.toggle_bookmark(text, text) from public;
grant execute on function public.toggle_bookmark(text, text) to authenticated;
