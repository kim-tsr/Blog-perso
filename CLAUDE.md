# CLAUDE.md

Portfolio de Kim Tessier (étudiant ingénieur cybersécurité, EPITA Rennes) pour sa recherche de stage de fin d'études DevSecOps (février 2027). Next.js (App Router), 100 % statique : pas de base de données, pas de compte, pas de CMS.

## Commandes
```bash
npm run dev      # dev server :3000
npm run build    # build de production
npm run lint     # ESLint
```
Lire `node_modules/next/dist/docs/` avant de coder (Next 16, breaking changes, cf. AGENTS.md).

## Routes
`/` accueil · `/projets` · `/technos` · `/a-propos` · `/contact`

## Contenu
- Projets : `lib/projects.ts` · Technos : `lib/technos.ts` · Coordonnées et méta : `lib/site.ts`
- CV : `public/CV_Kim_Tessier.pdf`

## Design
Tokens dans `app/globals.css` (`--bg #07070c`, accents `--v` violet, `--c` cyan, `--a` ambre). Polices : Space Grotesk, Figtree, Space Mono. Styles surtout en `<style>` dans les composants. Animations : `ScrollReveal`, easing `cubic-bezier(0.16,1,0.3,1)`. Canvas/curseur en `'use client'` avec cleanup. `index.html` = ancien prototype visuel.
