-- dev.sec.ops — Analytics 1st-party (sans cookie, sans IP, sans empreinte)
-- Table append-only, écriture publique via RPC, lecture admin-only.

-- ───────────────────────────────────────────────────────
-- 1. Table analytics_events
-- ───────────────────────────────────────────────────────
create table if not exists public.analytics_events (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users(id) on delete set null,
  anon_id       text,                       -- UUID v4 généré côté client, stocké en localStorage
  event         text not null,              -- 'page_view', 'lab_started', 'lab_completed', 'quiz_attempted', 'signup', 'upgrade_to_pro'
  content_type  text,                       -- 'lab', 'page', 'project'
  content_slug  text,
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists analytics_events_created_idx     on public.analytics_events(created_at desc);
create index if not exists analytics_events_event_idx       on public.analytics_events(event, created_at desc);
create index if not exists analytics_events_content_idx     on public.analytics_events(content_type, content_slug);
create index if not exists analytics_events_user_idx        on public.analytics_events(user_id) where user_id is not null;
create index if not exists analytics_events_anon_idx        on public.analytics_events(anon_id) where anon_id is not null;

alter table public.analytics_events enable row level security;

-- Lecture : admin only
drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Pas d'INSERT/UPDATE/DELETE direct — uniquement via RPC SECURITY DEFINER.

-- ───────────────────────────────────────────────────────
-- 2. RPC : track_event (anon + auth)
-- ───────────────────────────────────────────────────────
create or replace function public.track_event(
  p_event        text,
  p_content_type text default null,
  p_content_slug text default null,
  p_anon_id      text default null,
  p_payload      jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  -- Liste blanche des events autorisés (évite les pollutions)
  if p_event not in (
    'page_view', 'lab_started', 'lab_completed', 'quiz_attempted',
    'signup', 'upgrade_to_pro', 'bookmark_added'
  ) then
    return;
  end if;

  insert into public.analytics_events (user_id, anon_id, event, content_type, content_slug, payload)
  values (v_user, p_anon_id, p_event, p_content_type, p_content_slug, coalesce(p_payload, '{}'::jsonb));
end;
$$;

revoke all on function public.track_event(text, text, text, text, jsonb) from public;
grant execute on function public.track_event(text, text, text, text, jsonb) to anon, authenticated;

-- ───────────────────────────────────────────────────────
-- 3. Vue : content_view_stats (top contenus par vues sur 30j)
-- ───────────────────────────────────────────────────────
create or replace view public.content_view_stats
with (security_invoker = true)
as
select
  content_type,
  content_slug,
  count(*)                                              as views_total,
  count(distinct coalesce(user_id::text, anon_id))      as views_unique,
  count(*) filter (where created_at > now() - interval '7 days')  as views_7d,
  count(*) filter (where created_at > now() - interval '30 days') as views_30d,
  max(created_at)                                       as last_seen
from public.analytics_events
where event = 'page_view'
  and content_type is not null
  and content_slug is not null
group by content_type, content_slug;

grant select on public.content_view_stats to authenticated;

-- ───────────────────────────────────────────────────────
-- 4. Vue : lab_funnel_stats (vues → démarré → terminé par lab)
-- ───────────────────────────────────────────────────────
create or replace view public.lab_funnel_stats
with (security_invoker = true)
as
select
  content_slug as lab_slug,
  count(*) filter (where event = 'page_view')      as views,
  count(*) filter (where event = 'lab_started')    as started,
  count(*) filter (where event = 'lab_completed')  as completed,
  count(distinct user_id) filter (where event = 'lab_started')   as started_users,
  count(distinct user_id) filter (where event = 'lab_completed') as completed_users
from public.analytics_events
where content_type = 'lab' and content_slug is not null
group by content_slug;

grant select on public.lab_funnel_stats to authenticated;

-- ───────────────────────────────────────────────────────
-- 5. Vue : daily_traffic (séries temporelles 30j)
-- ───────────────────────────────────────────────────────
create or replace view public.daily_traffic
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date                                  as day,
  count(*) filter (where event = 'page_view')                          as views,
  count(distinct coalesce(user_id::text, anon_id)) filter (where event = 'page_view') as uniques,
  count(*) filter (where event = 'lab_started')                        as labs_started,
  count(*) filter (where event = 'lab_completed')                      as labs_completed,
  count(*) filter (where event = 'signup')                             as signups,
  count(*) filter (where event = 'upgrade_to_pro')                     as upgrades
from public.analytics_events
where created_at > now() - interval '30 days'
group by 1
order by 1 desc;

grant select on public.daily_traffic to authenticated;

-- ───────────────────────────────────────────────────────
-- 6. Vue : conversion_stats (signups → upgrades)
-- ───────────────────────────────────────────────────────
create or replace view public.conversion_stats
with (security_invoker = true)
as
select
  count(*) filter (where event = 'signup' and created_at > now() - interval '30 days')          as signups_30d,
  count(*) filter (where event = 'upgrade_to_pro' and created_at > now() - interval '30 days')  as upgrades_30d,
  count(*) filter (where event = 'signup')                                                       as signups_total,
  count(*) filter (where event = 'upgrade_to_pro')                                               as upgrades_total
from public.analytics_events;

grant select on public.conversion_stats to authenticated;
