-- 020_systemes_category.sql
--
-- Ajout du 4e thème "Systèmes" (kernel Linux, eBPF, profiling, hardening systemd).
-- Distinct de Cybersécurité (qui reste pour zero-trust, SIEM, IDS, etc.) et
-- d'Infrastructure (qui reste pour cloud, IaC, k8s, CI/CD).
-- Couleur dédiée : magenta (--s).

-- Le check constraint d'origine (006/008) n'autorise que violet/cyan/amber.
-- On le relâche pour inclure magenta avant l'insert.
alter table public.categories
  drop constraint if exists categories_theme_check;
alter table public.categories
  add constraint categories_theme_check
  check (theme in ('violet','cyan','amber','magenta'));

insert into public.categories (slug, label, description, theme, display_order)
values (
  'systemes',
  'Systèmes',
  'Kernel Linux, eBPF, profiling, hardening systemd — comprendre et maîtriser le bas niveau, là où tout converge.',
  'magenta',
  4
)
on conflict (slug) do update
  set label       = excluded.label,
      description = excluded.description,
      theme       = excluded.theme,
      display_order = excluded.display_order;

-- Re-tag des 6 labs concernés (s'ils existent en DB — sinon no-op, ils restent
-- chargés depuis le MDX avec le nouveau frontmatter).
update public.labs
   set category_slug = 'systemes'
 where slug in (
   'linux-01-systemd-hardening',
   'linux-02-capabilities-seccomp',
   'linux-03-apparmor-mac',
   'linux-04-auditd',
   'ebpf-from-zero',
   'perf-flamegraphs'
 );
