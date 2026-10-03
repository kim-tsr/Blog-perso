import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KortDetail from '@/components/KortDetail'
import Footer from '@/components/Footer'
import { PROJECTS } from '@/lib/projects'

export const dynamicParams = false

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
  if (slug !== 'kort') notFound()
  return (
    <>
      <main>
        <KortDetail />
      </main>
      <Footer />
    </>
  )
}
