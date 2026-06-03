-- 019_auto_publish_cron.sql
--
-- Auto-publish scheduled content via pg_cron.
--
-- Background:
--   Migration 016_drafts_scheduling.sql added `scheduled_for` columns to
--   `labs` and `projects`, and created `labs_public` / `projects_public` views
--   that surface rows where `published = true OR scheduled_for <= now()`.
--   This cron job flips `published = true` on those rows once the scheduled
--   time has passed, so the admin UI (which queries the underlying tables)
--   shows the correct "Published" status rather than "Scheduled".
--
-- The job runs every 5 minutes.
-- Requires: pg_cron extension (available on Supabase Pro and above).
--   If you are on the Free tier, enable it manually via the Supabase dashboard:
--   Database → Extensions → pg_cron, then re-run this migration.

-- Enable pg_cron extension (idempotent)
create extension if not exists pg_cron;

-- Register (or replace) the auto-publish cron job.
-- We unschedule first to make the migration safely re-runnable.
-- Note: nested dollar-quoted strings must use distinct tags ($outer$ / $cron$)
-- otherwise Postgres closes the outer block at the first inner $$.
do $outer$
begin
  -- Remove existing job if it already exists (ignore error if not found)
  begin
    perform cron.unschedule('auto_publish_scheduled_content');
  exception when others then
    -- Job did not exist — nothing to do
    null;
  end;

  -- Schedule the new job: every 5 minutes, flip scheduled content to published
  perform cron.schedule(
    'auto_publish_scheduled_content',
    '*/5 * * * *',
    $cron$
      update public.labs
         set published     = true,
             scheduled_for = null
       where published     = false
         and scheduled_for is not null
         and scheduled_for <= now();

      update public.projects
         set published     = true,
             scheduled_for = null
       where published     = false
         and scheduled_for is not null
         and scheduled_for <= now();
    $cron$
  );
end;
$outer$;
