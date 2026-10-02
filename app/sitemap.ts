import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { path: '', priority: 1.0 },
    { path: '/projets', priority: 0.9 },
    { path: '/technos', priority: 0.7 },
    { path: '/a-propos', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
  ].map(r => ({ url: `${SITE_URL}${r.path}`, lastModified: now, changeFrequency: 'monthly' as const, priority: r.priority }))
}
