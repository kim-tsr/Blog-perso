export type ArticleTag = 'Infrastructure' | 'Cybersécurité' | 'Réseau' | 'Systèmes' | string
export type ArticleTheme = 'violet' | 'cyan' | 'amber' | 'magenta'
export type MinRole = 'free' | 'pro' | 'admin'

export interface ArticleMeta {
  slug: string
  title: string
  date: string
  read: string
  tag: ArticleTag
  theme: ArticleTheme
  excerpt: string
  minRole: MinRole
}

export interface Article extends ArticleMeta {
  content: string
}

const THEME_MAP: Record<ArticleTheme, { tc: string; thumb: string; tl: string }> = {
  violet:  { tc: 'tv', thumb: 't-v', tl: 'infrastructure' },
  cyan:    { tc: 'tc', thumb: 't-c', tl: 'sécurité' },
  amber:   { tc: 'ta', thumb: 't-a', tl: 'réseau' },
  magenta: { tc: 'ts', thumb: 't-s', tl: 'systèmes' },
}

export function getThemeClasses(theme: ArticleTheme) {
  return THEME_MAP[theme]
}

/**
 * Mappe un tc (theme class 'tv'|'tc'|'ta'|'ts') vers la CSS var.
 * Pratique pour les `style` inline qui veulent un `--col` théme.
 */
export function themeColorVar(tc: string): string {
  if (tc === 'tv') return 'var(--v)'
  if (tc === 'tc') return 'var(--c)'
  if (tc === 'ts') return 'var(--s)'
  return 'var(--a)'
}

/**
 * Fallback statique en cas d'absence de Supabase ou pour les types.
 * La source de vérité est désormais la table public.categories.
 */
export const CATEGORIES = {
  infra:    { label: 'Infrastructure', tag: 'Infrastructure' as ArticleTag, theme: 'violet'  as ArticleTheme, desc: "Kubernetes, Terraform, CI/CD, containers — les fondations d'une infrastructure moderne, résiliente et automatisée." },
  sec:      { label: 'Cybersécurité',  tag: 'Cybersécurité'  as ArticleTag, theme: 'cyan'    as ArticleTheme, desc: "Zero Trust, SIEM, détection d'intrusion, hardening — sécuriser les systèmes sans compromis sur la fluidité." },
  reseau:   { label: 'Réseau',         tag: 'Réseau'          as ArticleTag, theme: 'amber'   as ArticleTheme, desc: "Routage, VPN, SDN, firewall — comprendre et maîtriser les flux réseau dans des architectures distribuées." },
  systemes: { label: 'Systèmes',       tag: 'Systèmes'       as ArticleTag,  theme: 'magenta' as ArticleTheme, desc: "Kernel Linux, eBPF, profiling, hardening systemd — comprendre et maîtriser le bas niveau, là où tout converge." },
}

export type CategorySlug = keyof typeof CATEGORIES | string
