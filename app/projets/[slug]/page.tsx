import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectDetail from '@/components/ProjectDetail'
import KortOverview from '@/components/KortOverview'
import ClassifierOverview from '@/components/ClassifierOverview'
import PadOverview from '@/components/PadOverview'
import Footer from '@/components/Footer'
import { PROJECTS } from '@/lib/projects'
import { KORT } from '@/lib/kort'
import { CLASSIFIER } from '@/lib/classifier'
import { PAD } from '@/lib/pad'

export const dynamicParams = false

const DETAILS = {
  kort: { story: KORT, overview: { label: 'Architecture', node: <KortOverview /> } },
  'penetrate-and-destroy': { story: PAD, overview: { label: 'Vue d\u2019ensemble', node: <PadOverview /> } },
  'classifieur-prompts': { story: CLASSIFIER, overview: { label: 'Résultats', node: <ClassifierOverview /> } },
} as const

export function generateStaticParams() {
  return PROJECTS.filter(p => p.slug).map(p => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = PROJECTS.find(x => x.slug === slug)
  return p ? { title: p.title, description: p.description } : {}
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = DETAILS[slug as keyof typeof DETAILS]
  if (!d) notFound()
  return (
    <>
      <main>
        <ProjectDetail story={d.story} overview={d.overview} />
      </main>
      <Footer />
    </>
  )
}
