import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getArticleBySlug } from '@/lib/articles'

export const runtime = 'nodejs'
export const alt = 'Article dev.sec.ops'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) {
    return renderOgImage({ title: 'dev.sec.ops', kind: 'article' })
  }
  return renderOgImage({
    title: article.title,
    subtitle: article.excerpt,
    kind: 'article',
    theme: article.theme,
    meta: `// ${article.date} · ${article.read}`,
  })
}
