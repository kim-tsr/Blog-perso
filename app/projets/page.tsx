import { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Mes Projets — dev.sec.ops',
  description: 'Projets personnels et open-source en infrastructure, cybersécurité et réseau.',
}

export type ProjectStatus = 'live' | 'beta' | 'wip' | 'archive'

export type Project = {
  title: string
  desc: string
  tags: string[]
  accent: 'v' | 'c' | 'a'
  status: ProjectStatus
  year: string
  github?: string
  live?: string
}

const PROJECTS: Project[] = [
  {
    title: 'k-leakd',
    desc: 'Détecteur de secrets dans les manifests Kubernetes — scan en pre-commit, intégration ArgoCD, règles personnalisables.',
    tags: ['Go', 'Kubernetes', 'eBPF', 'CLI'],
    accent: 'c',
    status: 'beta',
    year: '2026',
    github: 'https://github.com/kim-tsr',
  },
  {
    title: 'homelab-iac',
    desc: 'Infrastructure as Code complète pour mon homelab : Proxmox, Talos, ArgoCD, observabilité. Terraform + Ansible + GitOps.',
    tags: ['Terraform', 'Ansible', 'Proxmox', 'ArgoCD'],
    accent: 'v',
    status: 'live',
    year: '2026',
    github: 'https://github.com/kim-tsr',
  },
  {
    title: 'wg-mesh',
    desc: 'Maillage WireGuard automatique entre nœuds — découverte mDNS, rotation de clés, fallback NAT traversal.',
    tags: ['Rust', 'WireGuard', 'Networking'],
    accent: 'a',
    status: 'wip',
    year: '2026',
    github: 'https://github.com/kim-tsr',
  },
  {
    title: 'sec-flow',
    desc: 'Générateur de NetworkPolicies à partir d\'une capture eBPF — apprend du trafic réel pour produire des politiques restrictives.',
    tags: ['Cilium', 'eBPF', 'Python', 'Sécurité'],
    accent: 'c',
    status: 'wip',
    year: '2026',
    github: 'https://github.com/kim-tsr',
  },
  {
    title: 'wazuh-lab',
    desc: 'Lab SIEM tout-en-un : Wazuh + ELK + agents simulés + dashboards adaptés aux scénarios d\'attaque MITRE ATT&CK.',
    tags: ['Wazuh', 'ELK', 'Docker', 'MITRE'],
    accent: 'c',
    status: 'live',
    year: '2025',
    github: 'https://github.com/kim-tsr',
  },
  {
    title: 'bgp-edu',
    desc: 'Simulateur pédagogique de routage BGP — topologies prédéfinies, propagation visuelle, scénarios de filtrage et de fuite.',
    tags: ['BIRD', 'BGP', 'Réseau', 'Pédagogie'],
    accent: 'a',
    status: 'archive',
    year: '2025',
    github: 'https://github.com/kim-tsr',
  },
]

export default function ProjetsPage() {
  return <ProjectsClient projects={PROJECTS} />
}
