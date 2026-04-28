import { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Mes Projets — dev.sec.ops',
  description: 'Projets personnels et open-source en infrastructure, cybersécurité et réseau.',
}

export type Project = {
  title: string
  desc: string
  tags: string[]
  accent: 'v' | 'c' | 'a'
  github?: string
  live?: string
}

const PROJECTS: Project[] = [
  {
    title: 'Projet 1',
    desc: 'Description courte du projet. Remplacez cette liste par vos vrais projets.',
    tags: ['Kubernetes', 'Terraform', 'Go'],
    accent: 'v',
    github: 'https://github.com/kim-tessier',
    live: undefined,
  },
  {
    title: 'Projet 2',
    desc: 'Description courte du projet. Infrastructure as Code, CI/CD pipeline.',
    tags: ['Ansible', 'Docker', 'Python'],
    accent: 'c',
    github: 'https://github.com/kim-tessier',
    live: undefined,
  },
  {
    title: 'Projet 3',
    desc: 'Description courte du projet. Outil de sécurité réseau.',
    tags: ['Rust', 'eBPF', 'Linux'],
    accent: 'a',
    github: 'https://github.com/kim-tessier',
    live: undefined,
  },
]

export default function ProjetsPage() {
  return <ProjectsClient projects={PROJECTS} />
}
