-- dev.sec.ops — Seed de la série "API sécurisée from zero"

insert into public.lab_series (slug, title, description, theme)
values
  ('api-securisee-from-zero',
   'API sécurisée from zero',
   'Quatre labs qui construisent progressivement une API REST sécurisée : authentification JWT, rate limiting et RBAC, audit logging, threat hunting.',
   'cyan')
on conflict (slug) do nothing;
