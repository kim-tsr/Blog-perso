-- dev.sec.ops — Tables de contenu gérables par les admins
-- À exécuter dans Supabase SQL Editor APRÈS 005_fix_rls_recursion.sql

-- ───────────────────────────────────────────────────────
-- 1. Catégories (rubriques)
-- ───────────────────────────────────────────────────────
create table if not exists public.categories (
  slug          text primary key,
  label         text not null,
  description   text,
  theme         text not null check (theme in ('violet','cyan','amber')),
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────
-- 2. Articles
-- ───────────────────────────────────────────────────────
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  content       text not null default '',
  category_slug text references public.categories(slug) on delete set null,
  date_label    text not null,
  read_time     text not null,
  min_role      public.user_role not null default 'free',
  published     boolean not null default true,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_published_idx on public.articles(published) where published = true;
create index if not exists articles_category_idx  on public.articles(category_slug);

-- ───────────────────────────────────────────────────────
-- 3. Labs
-- ───────────────────────────────────────────────────────
create table if not exists public.labs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  objective     text not null,
  content       text not null default '',
  category_slug text references public.categories(slug) on delete set null,
  difficulty    text not null check (difficulty in ('débutant','intermédiaire','avancé')),
  duration      text not null,
  prerequisites text[] not null default '{}',
  tools         text[] not null default '{}',
  min_role      public.user_role not null default 'free',
  published     boolean not null default true,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists labs_published_idx on public.labs(published) where published = true;

-- ───────────────────────────────────────────────────────
-- 4. Projets
-- ───────────────────────────────────────────────────────
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  tags          text[] not null default '{}',
  category_slug text references public.categories(slug) on delete set null,
  status        text not null check (status in ('live','beta','wip','archive')),
  year          text,
  github_url    text,
  live_url      text,
  display_order integer not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────
-- 5. Triggers updated_at
-- ───────────────────────────────────────────────────────
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at before update on public.articles
  for each row execute function public.touch_updated_at();

drop trigger if exists labs_updated_at on public.labs;
create trigger labs_updated_at before update on public.labs
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.touch_updated_at();

-- ───────────────────────────────────────────────────────
-- 6. RLS
-- ───────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.articles   enable row level security;
alter table public.labs       enable row level security;
alter table public.projects   enable row level security;

-- Lecture publique du contenu publié, admins voient tout
drop policy if exists "categories_read" on public.categories;
create policy "categories_read"
  on public.categories for select
  using (true);

drop policy if exists "articles_read" on public.articles;
create policy "articles_read"
  on public.articles for select
  using (published = true or public.is_admin());

drop policy if exists "labs_read" on public.labs;
create policy "labs_read"
  on public.labs for select
  using (published = true or public.is_admin());

drop policy if exists "projects_read" on public.projects;
create policy "projects_read"
  on public.projects for select
  using (published = true or public.is_admin());

-- Écriture : admins seulement
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write"
  on public.articles for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "labs_admin_write" on public.labs;
create policy "labs_admin_write"
  on public.labs for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- ───────────────────────────────────────────────────────
-- 7. Seed des catégories
-- ───────────────────────────────────────────────────────
insert into public.categories (slug, label, description, theme, display_order)
values
  ('infra',  'Infrastructure', 'Kubernetes, Terraform, CI/CD, containers — les fondations d''une infrastructure moderne, résiliente et automatisée.', 'violet', 1),
  ('sec',    'Cybersécurité',  'Zero Trust, SIEM, détection d''intrusion, hardening — sécuriser les systèmes sans compromis sur la fluidité.',         'cyan',   2),
  ('reseau', 'Réseau',         'Routage, VPN, SDN, firewall — comprendre et maîtriser les flux réseau dans des architectures distribuées.',            'amber',  3)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────
-- 8. Seed des projets existants
-- ───────────────────────────────────────────────────────
insert into public.projects (title, description, tags, category_slug, status, year, github_url, display_order)
values
  ('k-leakd',     'Détecteur de secrets dans les manifests Kubernetes — scan en pre-commit, intégration ArgoCD, règles personnalisables.', array['Go','Kubernetes','eBPF','CLI'],                'sec',    'beta', '2026', 'https://github.com/kim-tsr', 1),
  ('homelab-iac', 'Infrastructure as Code complète pour mon homelab : Proxmox, Talos, ArgoCD, observabilité. Terraform + Ansible + GitOps.', array['Terraform','Ansible','Proxmox','ArgoCD'], 'infra',  'live', '2026', 'https://github.com/kim-tsr', 2),
  ('wg-mesh',     'Maillage WireGuard automatique entre nœuds — découverte mDNS, rotation de clés, fallback NAT traversal.',                 array['Rust','WireGuard','Networking'],          'reseau', 'wip',  '2026', 'https://github.com/kim-tsr', 3),
  ('sec-flow',    'Générateur de NetworkPolicies à partir d''une capture eBPF — apprend du trafic réel pour produire des politiques restrictives.', array['Cilium','eBPF','Python','Sécurité'], 'sec', 'wip',  '2026', 'https://github.com/kim-tsr', 4),
  ('wazuh-lab',   'Lab SIEM tout-en-un : Wazuh + ELK + agents simulés + dashboards adaptés aux scénarios d''attaque MITRE ATT&CK.',          array['Wazuh','ELK','Docker','MITRE'],           'sec',    'live', '2025', 'https://github.com/kim-tsr', 5),
  ('bgp-edu',     'Simulateur pédagogique de routage BGP — topologies prédéfinies, propagation visuelle, scénarios de filtrage et de fuite.', array['BIRD','BGP','Réseau','Pédagogie'],       'reseau', 'archive','2025','https://github.com/kim-tsr', 6)
on conflict do nothing;
