-- dev.sec.ops — Sécurisation de la vue access_codes_with_stats
-- À exécuter dans Supabase SQL Editor APRÈS 002_access_codes.sql
--
-- Problème : par défaut, une vue Postgres bypass les RLS des tables sous-jacentes
-- (elle s'exécute avec les droits du créateur, généralement postgres = superuser).
-- Correction : security_invoker = on → la vue utilise les droits de l'appelant,
-- donc les RLS de access_codes et code_redemptions s'appliquent.

drop view if exists public.access_codes_with_stats;

create view public.access_codes_with_stats
with (security_invoker = on)
as
select
  c.*,
  (select count(*) from public.code_redemptions r where r.code = c.code) as redeemed_count
from public.access_codes c;

comment on view public.access_codes_with_stats is
  'Vue admin-only des codes avec leur nombre d''activations. security_invoker = on → respecte les RLS de access_codes (admins uniquement).';

-- Vérification : non-admin doit recevoir 0 ligne
-- select * from public.access_codes_with_stats;
