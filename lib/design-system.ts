/**
 * dev.sec.ops — Design System
 * Source unique de vérité pour les tokens visuels du blog.
 * Synchronisé avec :root dans app/globals.css.
 */

export const COLORS = {
  bg:     '#07070c',
  bg2:    '#0c0c15',
  bg3:    '#11111e',
  border: 'rgba(255,255,255,0.07)',
  text:   '#ede9ff',
  dim:    '#5f5b78',
  mid:    '#9e9ab8',
  v:      'oklch(0.68 0.24 280)',
  c:      'oklch(0.75 0.16 194)',
  a:      'oklch(0.76 0.16 65)',
  gv:     'oklch(0.50 0.28 280 / 0.30)',
  gc:     'oklch(0.50 0.18 194 / 0.22)',
  ga:     'oklch(0.54 0.18 65 / 0.22)',
} as const

export const FONTS = {
  display: 'var(--fd)',
  body:    'var(--fb)',
  mono:    'var(--fm)',
} as const

export const SPACING = {
  xs: 8,
  sm: 14,
  md: 24,
  lg: 40,
  xl: 64,
  '2xl': 100,
  '3xl': 130,
} as const

export const RADII = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   24,
  pill: 100,
} as const

export const EASING = 'cubic-bezier(0.16,1,0.3,1)'

export const SHADOWS = {
  cardHover:   '0 24px 64px rgba(0,0,0,.6)',
  largeHover:  '0 32px 80px rgba(0,0,0,.7)',
  glowViolet:  '0 12px 48px var(--gv)',
  glowCyan:    '0 12px 48px var(--gc)',
  glowAmber:   '0 12px 48px var(--ga)',
} as const

export const TYPE_SCALE = {
  hero:    'clamp(60px,8.5vw,110px)',
  display: 'clamp(38px,5vw,58px)',
  h1:      'clamp(32px,5vw,56px)',
  h2:      '24px',
  h3:      '20px',
  body:    '16px',
  small:   '14px',
  xs:      '11px',
  micro:   '10px',
} as const

export type ThemeName = 'violet' | 'cyan' | 'amber'

export const THEMES: Record<ThemeName, {
  label: string
  color: string
  bg: string
  border: string
  glow: string
}> = {
  violet: {
    label:  'Infrastructure',
    color:  'var(--v)',
    bg:     'oklch(0.68 0.24 280/.12)',
    border: 'oklch(0.68 0.24 280/.25)',
    glow:   'var(--gv)',
  },
  cyan: {
    label:  'Cybersécurité',
    color:  'var(--c)',
    bg:     'oklch(0.75 0.16 194/.12)',
    border: 'oklch(0.75 0.16 194/.25)',
    glow:   'var(--gc)',
  },
  amber: {
    label:  'Réseau',
    color:  'var(--a)',
    bg:     'oklch(0.76 0.16 65/.12)',
    border: 'oklch(0.76 0.16 65/.25)',
    glow:   'var(--ga)',
  },
}
