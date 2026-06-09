import { createPublicClient } from './supabase/service'

export type ProjectStatus = 'live' | 'beta' | 'wip' | 'archive'
export type ProjectAccent = 'v' | 'c' | 'a'

export interface Project {
  id?: string
  title: string
  description: string
  tags: string[]
  category_slug: string | null
  status: ProjectStatus
  year: string | null
  github_url: string | null
  live_url: string | null
  display_order: number
  published: boolean
}

const FALLBACK: Project[] = [
  { title: 'Mir[AI]ge',    description: 'Moteur de déception défensive (« defense by attrition ») : piège les attaquants augmentés par l\'IA dans une fausse réalité conçue pour épuiser leur puissance de calcul. Site vitrine et console opérateur mission-control.', tags: ['Sécurité','IA','Deception','React'], category_slug: 'sec',    status: 'live', year: '2026', github_url: 'https://github.com/kim-tsr/Miraige-Website', live_url: 'https://miraige.vercel.app', display_order: 1, published: true },
  { title: 'Lab Anti-DDoS', description: 'Automatisation Ansible de durcissement anti-DDoS : déploiement idempotent de rate-limiting, filtrage et règles de mitigation réseau via playbooks et templates Jinja.', tags: ['Ansible','Anti-DDoS','Réseau','Jinja'], category_slug: 'reseau', status: 'wip',  year: '2026', github_url: 'https://github.com/kim-tsr/Ansible-Anti-DDOS', live_url: null, display_order: 2, published: true },
  { title: 'Leçon·io',     description: 'SaaS EdTech pour enseignants français : choisir un template pédagogique, le personnaliser et partager le lien avec ses élèves. Next.js 15, Supabase et design system maison.', tags: ['Next.js','TypeScript','Supabase','EdTech'], category_slug: 'infra', status: 'beta', year: '2026', github_url: 'https://github.com/kim-tsr/Le-on-io', live_url: null, display_order: 3, published: true },
]

export async function getAllProjects(): Promise<Project[]> {
  const supabase = createPublicClient()
  if (!supabase) return FALLBACK
  const { data, error } = await supabase
    .from('projects_public')
    .select('*')
    .order('display_order', { ascending: true })
  if (error || !data || data.length === 0) return FALLBACK
  return data as Project[]
}

export function categoryToAccent(slug: string | null | undefined): ProjectAccent {
  if (slug === 'infra')  return 'v'
  if (slug === 'sec')    return 'c'
  if (slug === 'reseau') return 'a'
  return 'v'
}

// ── Slugs ─────────────────────────────────────────────────
// Les projets DB n'ont pas de colonne slug ; on dérive un slug stable
// du titre. Slugs explicites pour les titres « exotiques » (crochets,
// accents, points médians), slugify générique sinon.
const SLUG_BY_TITLE: Record<string, string> = {
  'Mir[AI]ge':    'miraige',
  'Lab Anti-DDoS': 'lab-anti-ddos',
  'Leçon·io':     'lecon-io',
}

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function projectSlug(title: string): string {
  return SLUG_BY_TITLE[title] ?? slugify(title)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const all = await getAllProjects()
  return all.find(p => projectSlug(p.title) === slug)
}

// ── Pages de détail ───────────────────────────────────────
// Contenu long, géré dans le code (projets perso peu changeants), keyé
// par slug. Le résumé court reste la `description` DB.
export interface ProjectDetail {
  tagline: string
  overview: string[]
  highlights: string[]
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'miraige': {
    tagline: 'Defense by attrition — retourner l\'IA offensive contre elle-même.',
    overview: [
      'Mir[AI]ge part d\'un constat simple : les attaquants s\'appuient de plus en plus sur des agents IA pour scanner, énumérer et exploiter à grande échelle. Plutôt que de seulement bloquer, Mir[AI]ge retourne cette automatisation contre eux.',
      'Le principe — « defense by attrition » — consiste à enfermer l\'attaquant augmenté par l\'IA dans une fausse réalité crédible : services factices, données leurres, topologies générées à la volée. Chaque interaction consomme du temps et de la puissance de calcul côté attaquant, sans jamais exposer le vrai système.',
      'Le dépôt regroupe le site vitrine du produit et une maquette de console opérateur (« mission-control ») qui visualise les pièges actifs, les sessions piégées et les ressources brûlées par l\'adversaire.',
    ],
    highlights: [
      'Environnements leurres générés dynamiquement',
      'Console mission-control : sessions piégées et compute brûlé',
      'Design system maison (tokens, typographies Syncopate / Rajdhani)',
      'Déploiement statique sur Vercel, sans étape de build',
    ],
  },
  'lab-anti-ddos': {
    tagline: 'Comprendre et mitiger le DDoS, en infrastructure-as-code.',
    overview: [
      'Lab Anti-DDoS est un terrain d\'expérimentation pour comprendre et atténuer les attaques par déni de service distribué, entièrement piloté par Ansible.',
      'L\'objectif est pédagogique : partir d\'un serveur nu et appliquer, de façon idempotente et reproductible, les couches de défense usuelles — rate-limiting, filtrage réseau, durcissement noyau — puis observer leur effet sous charge.',
      'Tout est versionné et rejouable : on peut détruire la machine, relancer les playbooks, et retrouver exactement le même état durci.',
    ],
    highlights: [
      'Playbooks Ansible idempotents et rejouables',
      'Templates Jinja paramétrables (seuils, listes d\'autorisation)',
      'Couches de mitigation : rate-limiting, filtrage, durcissement',
      'Approche infrastructure-as-code, intégralement versionnée',
    ],
  },
  'lecon-io': {
    tagline: 'Créer un support pédagogique et le partager en un lien.',
    overview: [
      'Leçon·io est un SaaS EdTech pensé pour les enseignants français : créer rapidement des supports pédagogiques à partir de templates, les personnaliser, puis partager un simple lien avec ses élèves.',
      'L\'application mise sur la rapidité et la simplicité — pas de configuration lourde, un design « sketch » fait main, et une base de données pensée pour la confidentialité des données scolaires (RLS, hébergement en UE).',
      'Côté technique, c\'est une application Next.js 15 (App Router, TypeScript strict) adossée à Supabase et déployée sur Vercel.',
    ],
    highlights: [
      'Templates pédagogiques personnalisables',
      'Partage par lien, sans compte élève à créer',
      'Next.js 15 App Router + TypeScript strict, Tailwind v4',
      'Supabase (PostgreSQL UE, RLS, Auth), déploiement Vercel',
    ],
  },
}
