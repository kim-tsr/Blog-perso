import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PadDocs from '@/components/PadDocs'
import Footer from '@/components/Footer'

// Seul PenetrateAndDestroy a une documentation archivée (public/pad-docs) ; les autres slugs répondent 404.
const WITH_DOCS = ['penetrate-and-destroy'] as const

export const dynamicParams = false

export function generateStaticParams() {
  return WITH_DOCS.map(slug => ({ slug }))
}

export const metadata: Metadata = {
  title: 'Documentation de PenetrateAndDestroy',
  description: 'Archive statique de la documentation MkDocs de PenetrateAndDestroy : architecture, ADR, composants, guide de déploiement et runbooks.',
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!WITH_DOCS.includes(slug as (typeof WITH_DOCS)[number])) notFound()
  return (
    <>
      <main>
        <PadDocs />
      </main>
      <Footer />
    </>
  )
}
