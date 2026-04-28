import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Article, ArticleMeta, ArticleTag, ArticleTheme, CATEGORIES, CategorySlug } from './theme'

export type { Article, ArticleMeta, ArticleTag, ArticleTheme, CategorySlug }
export { getThemeClasses, CATEGORIES } from './theme'

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

export function getAllArticles(): Article[] {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      return {
        slug:    data.slug as string,
        title:   data.title as string,
        date:    data.date as string,
        read:    data.read as string,
        tag:     data.tag as ArticleTag,
        theme:   data.theme as ArticleTheme,
        excerpt: data.excerpt as string,
        content,
      }
    })
    .sort((a, b) => {
      const months: Record<string, number> = {
        'Jan': 1, 'Fév': 2, 'Mar': 3, 'Avr': 4, 'Mai': 5, 'Jun': 6,
        'Jul': 7, 'Aoû': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Déc': 12,
      }
      const parse = (d: string) => {
        const [day, mon, year] = d.split(' ')
        return new Date(parseInt(year), (months[mon] ?? 1) - 1, parseInt(day))
      }
      return parse(b.date).getTime() - parse(a.date).getTime()
    })
}

export function getAllArticleMeta(): ArticleMeta[] {
  return getAllArticles().map(({ content: _c, ...meta }) => meta)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find(a => a.slug === slug)
}

export function getArticlesByCategory(slug: CategorySlug): ArticleMeta[] {
  const cat = CATEGORIES[slug]
  if (!cat) return []
  return getAllArticleMeta().filter(a => a.tag === cat.tag)
}
