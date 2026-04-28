export type ArticleTag = 'Infrastructure' | 'Cybersécurité' | 'Réseau'
export type ArticleTheme = 'violet' | 'cyan' | 'amber'

export interface ArticleMeta {
  slug: string
  title: string
  date: string
  read: string
  tag: ArticleTag
  theme: ArticleTheme
  excerpt: string
}

export interface Article extends ArticleMeta {
  content: string
}

const THEME_MAP: Record<ArticleTheme, { tc: string; thumb: string; tl: string }> = {
  violet: { tc: 'tv', thumb: 't-v', tl: 'infrastructure' },
  cyan:   { tc: 'tc', thumb: 't-c', tl: 'sécurité' },
  amber:  { tc: 'ta', thumb: 't-a', tl: 'réseau' },
}

export function getThemeClasses(theme: ArticleTheme) {
  return THEME_MAP[theme]
}

export const CATEGORIES = {
  infra:  { label: 'Infrastructure', tag: 'Infrastructure' as ArticleTag, theme: 'violet' as ArticleTheme, desc: "Kubernetes, Terraform, CI/CD, containers — les fondations d'une infrastructure moderne, résiliente et automatisée." },
  sec:    { label: 'Cybersécurité',  tag: 'Cybersécurité'  as ArticleTag, theme: 'cyan'   as ArticleTheme, desc: "Zero Trust, SIEM, détection d'intrusion, hardening — sécuriser les systèmes sans compromis sur la fluidité." },
  reseau: { label: 'Réseau',         tag: 'Réseau'          as ArticleTag, theme: 'amber'  as ArticleTheme, desc: "Routage, VPN, SDN, firewall — comprendre et maîtriser les flux réseau dans des architectures distribuées." },
}

export type CategorySlug = keyof typeof CATEGORIES
