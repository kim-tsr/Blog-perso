import { getAllLabMeta } from '@/lib/labs'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_AUTHOR } from '@/lib/site'

export const dynamic = 'force-dynamic'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const labs = await getAllLabMeta()

  const now = new Date().toUTCString()

  const items = labs.map(lab => {
    const url = `${SITE_URL}/labs/${lab.slug}`
    return `    <item>
      <title>${escapeXml(lab.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${now}</pubDate>
      <category>${escapeXml(lab.tag)}</category>
      <category>${escapeXml(lab.difficulty)}</category>
      <description>${escapeXml(lab.objective)}</description>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Labs</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>fr-FR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <managingEditor>${escapeXml(SITE_AUTHOR)}</managingEditor>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}
