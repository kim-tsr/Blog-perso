import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getLabBySlug } from '@/lib/labs'

export const runtime = 'nodejs'
export const alt = 'Lab dev.sec.ops'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lab = await getLabBySlug(slug)
  if (!lab) {
    return renderOgImage({ title: 'dev.sec.ops', kind: 'lab' })
  }
  return renderOgImage({
    title: lab.title,
    subtitle: lab.objective,
    kind: 'lab',
    theme: lab.theme,
    meta: `// ${lab.difficulty} · ${lab.duration}`,
  })
}
