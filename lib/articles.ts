import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Article, ArticleMeta, ArticleTag, ArticleTheme, CATEGORIES, CategorySlug, MinRole } from './theme'
import { createPublicClient } from './supabase/service'

export type { Article, ArticleMeta, ArticleTag, ArticleTheme, CategorySlug }
export { getThemeClasses, CATEGORIES } from './theme'

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

interface DbArticleRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  category_slug: string | null
  date_label: string
  read_time: string
  min_role: MinRole
  published: boolean
}

const SLUG_TO_TAG: Record<string, ArticleTag> = {
  infra: 'Infrastructure',
  sec: 'Cybersécurité',
  reseau: 'Réseau',
}

const SLUG_TO_THEME: Record<string, ArticleTheme> = {
  infra: 'violet',
  sec:   'cyan',
  reseau:'amber',
}

function dbRowToArticle(r: DbArticleRow): Article {
  const slug = r.category_slug ?? 'infra'
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? '',
    content: r.content,
    date: r.date_label,
    read: r.read_time,
    tag: SLUG_TO_TAG[slug] ?? 'Infrastructure',
    theme: SLUG_TO_THEME[slug] ?? 'violet',
    minRole: r.min_role,
  }
}

function readMdxArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  return files.map(file => {
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
      minRole: ((data.minRole ?? 'free') as MinRole),
      content,
    }
  })
}

function parseFrenchDate(d: string): Date {
  const months: Record<string, number> = {
    'Jan': 1, 'Fév': 2, 'Mar': 3, 'Avr': 4, 'Mai': 5, 'Jun': 6,
    'Jul': 7, 'Aoû': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Déc': 12,
  }
  const [day, mon, year] = (d || '').split(' ')
  return new Date(parseInt(year || '2000'), (months[mon] ?? 1) - 1, parseInt(day || '1'))
}

export async function getAllArticles(): Promise<Article[]> {
  const supabase = createPublicClient()
  const fs_articles = readMdxArticles()
  let db_articles: Article[] = []

  if (supabase) {
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, content, category_slug, date_label, read_time, min_role, published')
      .eq('published', true)
    if (data) db_articles = (data as DbArticleRow[]).map(dbRowToArticle)
  }

  // DB prend la priorité — un slug en DB écrase le MDX du même slug
  const merged = new Map<string, Article>()
  for (const a of fs_articles) merged.set(a.slug, a)
  for (const a of db_articles) merged.set(a.slug, a)

  return Array.from(merged.values())
    .sort((a, b) => parseFrenchDate(b.date).getTime() - parseFrenchDate(a.date).getTime())
}

export async function getAllArticleMeta(): Promise<ArticleMeta[]> {
  const arts = await getAllArticles()
  return arts.map(({ content: _c, ...meta }) => meta)
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const all = await getAllArticles()
  return all.find(a => a.slug === slug)
}

export async function getArticlesByCategory(slug: CategorySlug): Promise<ArticleMeta[]> {
  const cat = CATEGORIES[slug as keyof typeof CATEGORIES]
  if (!cat) return []
  const all = await getAllArticleMeta()
  return all.filter(a => a.tag === cat.tag)
}
