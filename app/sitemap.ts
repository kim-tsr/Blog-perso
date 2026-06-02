import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllArticleMeta } from '@/lib/articles'
import { getAllLabMeta } from '@/lib/labs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, labs] = await Promise.all([
    getAllArticleMeta(),
    getAllLabMeta(),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,             lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/blog`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/labs`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/projets`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/roadmap`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/a-propos`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${SITE_URL}/design-system`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/categories/infra`,  lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/categories/sec`,    lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/categories/reseau`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const labRoutes: MetadataRoute.Sitemap = labs.map(l => ({
    url: `${SITE_URL}/labs/${l.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...articleRoutes, ...labRoutes]
}
