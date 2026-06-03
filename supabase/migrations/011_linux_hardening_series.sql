-- dev.sec.ops — Seed série "Linux hardening from zero"

insert into public.lab_series (slug, title, description, theme)
values
  ('linux-hardening-from-zero',
   'Linux hardening from zero',
   'Quatre labs progressifs pour durcir un système Linux moderne : sandboxing systemd, capabilities + seccomp, AppArmor (MAC), audit framework.',
   'cyan')
on conflict (slug) do nothing;
