-- ───────────────────────────────────────────────────────
-- 022 — Mise à jour du portfolio : 3 projets réels
--
-- Remplace les 6 projets de démonstration semés en 006 par les
-- 3 projets réels (Mir[AI]ge mis en avant en premier).
-- Idempotent : on vide la table puis on réinsère les 3 lignes,
-- donc rejouable sans créer de doublons.
-- ───────────────────────────────────────────────────────

begin;

delete from public.projects;

insert into public.projects
  (title, description, tags, category_slug, status, year, github_url, live_url, display_order, published)
values
  (
    'Mir[AI]ge',
    'Moteur de déception défensive (« defense by attrition ») : piège les attaquants augmentés par l''IA dans une fausse réalité conçue pour épuiser leur puissance de calcul. Site vitrine et console opérateur mission-control.',
    array['Sécurité','IA','Deception','React'],
    'sec',
    'live',
    '2026',
    'https://github.com/kim-tsr/Miraige-Website',
    'https://miraige.vercel.app',
    1,
    true
  ),
  (
    'Lab Anti-DDoS',
    'Automatisation Ansible de durcissement anti-DDoS : déploiement idempotent de rate-limiting, filtrage et règles de mitigation réseau via playbooks et templates Jinja.',
    array['Ansible','Anti-DDoS','Réseau','Jinja'],
    'reseau',
    'wip',
    '2026',
    'https://github.com/kim-tsr/Ansible-Anti-DDOS',
    null,
    2,
    true
  ),
  (
    'Leçon·io',
    'SaaS EdTech pour enseignants français : choisir un template pédagogique, le personnaliser et partager le lien avec ses élèves. Next.js 15, Supabase et design system maison.',
    array['Next.js','TypeScript','Supabase','EdTech'],
    'infra',
    'beta',
    '2026',
    'https://github.com/kim-tsr/Le-on-io',
    null,
    3,
    true
  );

commit;
