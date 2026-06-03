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
  { title: 'k-leakd',     description: 'Détecteur de secrets dans les manifests Kubernetes.', tags: ['Go','Kubernetes','eBPF'],          category_slug: 'sec',    status: 'beta',    year: '2026', github_url: 'https://github.com/kim-tsr', live_url: null, display_order: 1, published: true },
  { title: 'homelab-iac', description: 'IaC complète pour mon homelab.',                     tags: ['Terraform','Ansible','Proxmox'],   category_slug: 'infra',  status: 'live',    year: '2026', github_url: 'https://github.com/kim-tsr', live_url: null, display_order: 2, published: true },
  { title: 'wg-mesh',     description: 'Maillage WireGuard automatique entre nœuds.',        tags: ['Rust','WireGuard'],                category_slug: 'reseau', status: 'wip',     year: '2026', github_url: 'https://github.com/kim-tsr', live_url: null, display_order: 3, published: true },
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
