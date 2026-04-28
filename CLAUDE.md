# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

French DevSecOps blog — **dev.sec.ops** — built with Next.js (App Router). The pixel-perfect reference is `index.html` (standalone HTML prototype, 1178 lines). All visual decisions live there; the Next.js app must match it exactly.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # ESLint
```

## Architecture

### Target stack
- **Next.js 14+ App Router** — `app/` directory
- **CSS Modules** or **Tailwind** for styling — no CSS-in-JS
- **MDX** for article content (replace the hardcoded `ARTS` array in index.html)
- No CMS yet — articles live in `content/articles/` as `.mdx` files

### Pages / routes
| Route | Description |
|---|---|
| `/` | Home — hero, about, pillars, articles grid, newsletter |
| `/articles/[slug]` | Full article page (currently an overlay in the prototype) |
| `/categories/[slug]` | Category filter page (`infra`, `sec`, `reseau`) |

### Design tokens (from prototype)
```css
--bg: #07070c      /* main background */
--v:  oklch(0.68 0.24 280)   /* violet accent */
--c:  oklch(0.75 0.16 194)   /* cyan accent */
--a:  oklch(0.76 0.16 65)    /* amber accent */
```
Fonts (Google Fonts): **Space Grotesk** (display/headings), **Figtree** (body), **Space Mono** (mono/labels).

### Key components to build
- `CustomCursor` — dot + ring, `mix-blend-mode: difference`, hover expansion (`'use client'`)
- `HeroCanvas` — particle system reactive to mouse, 3 animated orbs (Canvas 2D, `'use client'`)
- `FxCanvas` — fixed fullscreen canvas: cursor aura, sparks, 2 wireframe 3D shapes
- `ScrollProgress` — 2px violet bar at top
- `SideNav` — fixed right, dot + active pill indicator per section
- `PillarCard` — 3D tilt on hover, sweep glow, click → category transition
- `ArticleCard` — parallax thumbnail on scroll, tilt 3D
- `CategoryOverlay` + `ArticleOverlay` — full-screen slide-up panels
- `BeamSeparator` — gradient hr with radial glow

### Animation conventions (match prototype exactly)
- Scroll reveal: `opacity:0 → 1`, `translateY(48px → 0)`, class `.reveal` toggled by IntersectionObserver
- Clip-path title reveal: `translateY(105% → 0)` inside overflow-hidden wrapper
- Stagger delays: `reveal-d1` through `reveal-d4` (0.1s increments)
- Easing: `cubic-bezier(0.16,1,0.3,1)` throughout

### Article data model (from prototype `ARTS` array)
```ts
type Article = {
  id: number
  tag: 'Infrastructure' | 'Cybersécurité' | 'Réseau'
  tc: 'tv' | 'tc' | 'ta'        // theme class: violet / cyan / amber
  date: string
  read: string
  title: string
  content: string                // MDX in real app
}
```
Categories map: `infra → Infrastructure`, `sec → Cybersécurité`, `reseau → Réseau`.

### Canvas / animation components
All canvas-based FX (`HeroCanvas`, `FxCanvas`) must be `'use client'` with `useEffect` for setup and cleanup (`cancelAnimationFrame`, `removeEventListener`). Resize handlers required. The `CustomCursor` component hides on touch devices (`window.matchMedia('(pointer: coarse)')`).
