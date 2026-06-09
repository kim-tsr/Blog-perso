import { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'
import { getAllProjects, categoryToAccent, projectSlug } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Mes Projets — dev.sec.ops',
  description: 'Projets personnels et open-source en infrastructure, cybersécurité et réseau.',
}

export type ProjectStatus = 'live' | 'beta' | 'wip' | 'archive'

export type Project = {
  slug: string
  title: string
  desc: string
  tags: string[]
  accent: 'v' | 'c' | 'a'
  status: ProjectStatus
  year: string
  github?: string
  live?: string
}

export default async function ProjetsPage() {
  const dbProjects = await getAllProjects()
  const projects: Project[] = dbProjects.map(p => ({
    slug:   projectSlug(p.title),
    title:  p.title,
    desc:   p.description,
    tags:   p.tags,
    accent: categoryToAccent(p.category_slug),
    status: p.status,
    year:   p.year ?? '',
    github: p.github_url ?? undefined,
    live:   p.live_url ?? undefined,
  }))
  return <ProjectsClient projects={projects} />
}
