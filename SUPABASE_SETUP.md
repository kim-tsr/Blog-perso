# Configuration Supabase

Guide rapide pour activer l'authentification et le gating de contenu.

---

## 1. Créer le projet Supabase

1. Va sur https://supabase.com/dashboard, **New project**
2. Note le **Project URL** et la **anon public key** (Settings → API)
3. Crée un fichier `.env.local` à la racine :

   ```bash
   cp .env.local.example .env.local
   ```

4. Remplis les deux variables avec tes valeurs Supabase

---

## 2. Exécuter les migrations SQL

Dans **Supabase Dashboard → SQL Editor → New query**, exécute dans l'ordre :

### `supabase/migrations/001_profiles.sql`

- Table `public.profiles` avec un enum `role` (`free` / `pro` / `admin`)
- Trigger auto-création du profil à chaque inscription
- RLS qui empêchent un user de modifier son propre rôle
- Table `lab_progress` (bonus) pour la progression sur les labs

### `supabase/migrations/002_access_codes.sql`

- Table `public.access_codes` — codes d'invitation
- Table `public.code_redemptions` — historique des activations
- Fonction RPC `redeem_access_code(p_code)` (atomique, `security definer`)
- Vue `access_codes_with_stats` pour les compteurs

Les deux migrations doivent passer sans erreur.

---

## 3. Activer les providers OAuth

### GitHub

1. **GitHub → Settings → Developer settings → OAuth Apps → New**
2. Application name : `dev.sec.ops`
3. Homepage URL : `http://localhost:3000` (dev) ou ton URL Vercel
4. Authorization callback URL : `https://<projet>.supabase.co/auth/v1/callback`
5. Copie le **Client ID** et **Client secret**
6. Dans **Supabase → Authentication → Providers → GitHub** : active, colle les deux valeurs, Save

### Google

1. **Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID** (Web app)
2. Authorized redirect URI : `https://<projet>.supabase.co/auth/v1/callback`
3. Dans **Supabase → Authentication → Providers → Google** : active, colle Client ID + secret

### Magic link (email)

Aucune config — actif par défaut. En production, configure un SMTP custom dans **Authentication → Email Templates** pour ne pas être limité au quota gratuit de 4 emails/heure.

---

## 4. Ajouter l'URL de redirection autorisée

**Supabase → Authentication → URL Configuration** :

- **Site URL** : `http://localhost:3000` puis ton URL Vercel en prod
- **Redirect URLs** : ajoute `http://localhost:3000/auth/callback` et `https://<ton-domaine>/auth/callback`

---

## 5. Tester

```bash
npm run dev
```

1. Va sur http://localhost:3000/auth/signin
2. Connecte-toi avec GitHub, Google ou magic link
3. Tu atterris sur `/account` en tant que **Free** par défaut

---

## 6. Te promouvoir admin

Une fois connecté une première fois, dans le **SQL Editor** :

```sql
update public.profiles
set role = 'admin'
where email = 'kim.tessier07@gmail.com';
```

Recharge `/account` → ton rôle est maintenant **Admin**.

---

## 7. Codes d'accès (admin)

Une fois admin, va sur `/admin/codes`. Tu peux :

- **Générer un code** au format `DSO-XXXX-XXXX` (ou imposer le tien)
- Choisir le rôle octroyé : `pro` ou `admin`
- Limiter à N utilisations et/ou poser une date d'expiration
- Désactiver ou supprimer un code existant
- Voir l'historique des activations (qui a utilisé quoi, quand)

Côté user (page `/account`), un champ « Activer un code » accepte la saisie. La logique d'upgrade est gérée par la fonction RPC `redeem_access_code` côté Postgres — atomique, anti-replay, anti-downgrade.

## 8. Gating en pratique

Dans le frontmatter d'un article ou d'un lab MDX :

```yaml
---
title: "Mon article"
minRole: pro      # ← gate au niveau Pro
---
```

Valeurs possibles : `free` (défaut), `pro`, `admin`.

Pour qu'un user accède à un contenu `pro` : soit tu changes son rôle dans le SQL Editor, soit (mieux) tu lui envoies un code généré depuis `/admin/codes`.

Les articles/labs gated affichent un badge cadenas dans les listes, et un paywall élégant à la place du contenu pour les utilisateurs non-autorisés.

---

## 9. Déploiement Vercel

1. **Vercel Dashboard → Project → Settings → Environment Variables**
2. Ajoute `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Dans Supabase, ajoute l'URL Vercel à **Site URL** et **Redirect URLs**
4. Push → tout fonctionne, **aucun VPS nécessaire**

---

## Quotas Supabase free tier

- **500 MB** de DB (largement suffisant pour quelques milliers de users)
- **50 000 MAU** authentifiés / mois
- **Pause automatique** après 7 jours d'inactivité → premier hit lent, négligeable en prod

Pour scale au-delà : plan Pro à $25/mois ou self-host (= VPS). Tu n'y arriveras pas avant longtemps.
