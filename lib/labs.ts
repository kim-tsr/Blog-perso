import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ArticleTag, ArticleTheme, MinRole } from './theme'
import { createPublicClient } from './supabase/service'

export type LabDifficulty = 'débutant' | 'intermédiaire' | 'avancé'

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

export interface LabMeta {
  slug: string
  title: string
  objective: string
  tag: ArticleTag
  theme: ArticleTheme
  difficulty: LabDifficulty
  duration: string
  prerequisites: string[]
  tools: string[]
  minRole: MinRole
  series?: string | null
  seriesOrder?: number | null
  quiz?: QuizQuestion[]
}

export interface Lab extends LabMeta {
  content: string
}

const LABS_DIR = path.join(process.cwd(), 'content/labs')

const DIFFICULTY_ORDER: Record<LabDifficulty, number> = {
  'débutant':      0,
  'intermédiaire': 1,
  'avancé':        2,
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

interface DbLabRow {
  id: string
  slug: string
  title: string
  objective: string
  content: string
  category_slug: string | null
  difficulty: LabDifficulty
  duration: string
  prerequisites: string[]
  tools: string[]
  min_role: MinRole
  published: boolean
  series_slug?: string | null
  series_order?: number | null
}

function dbRowToLab(r: DbLabRow): Lab {
  const slug = r.category_slug ?? 'infra'
  return {
    slug: r.slug,
    title: r.title,
    objective: r.objective,
    tag: SLUG_TO_TAG[slug] ?? 'Infrastructure',
    theme: SLUG_TO_THEME[slug] ?? 'violet',
    difficulty: r.difficulty,
    duration: r.duration,
    prerequisites: r.prerequisites ?? [],
    tools: r.tools ?? [],
    minRole: r.min_role,
    series:  r.series_slug ?? null,
    seriesOrder: r.series_order ?? null,
    content: r.content,
  }
}

function readMdxLabs(): Lab[] {
  if (!fs.existsSync(LABS_DIR)) return []
  const files = fs.readdirSync(LABS_DIR).filter(f => f.endsWith('.mdx'))
  return files.map(file => {
    const raw = fs.readFileSync(path.join(LABS_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug:          data.slug as string,
      title:         data.title as string,
      objective:     data.objective as string,
      tag:           data.tag as ArticleTag,
      theme:         data.theme as ArticleTheme,
      difficulty:    data.difficulty as LabDifficulty,
      duration:      data.duration as string,
      prerequisites: (data.prerequisites ?? []) as string[],
      tools:         (data.tools ?? []) as string[],
      minRole:       ((data.minRole ?? 'free') as MinRole),
      series:        (data.series ?? null) as string | null,
      seriesOrder:   (data.seriesOrder ?? null) as number | null,
      quiz:          (data.quiz ?? null) as QuizQuestion[] | null ?? undefined,
      content,
    }
  })
}

export async function getAllLabs(): Promise<Lab[]> {
  const supabase = createPublicClient()
  const fs_labs = readMdxLabs()
  let db_labs: Lab[] = []

  if (supabase) {
    // labs_public = published OR scheduled_for <= now() — défini par migration 016
    const { data } = await supabase
      .from('labs_public')
      .select('*')
    if (data) db_labs = (data as DbLabRow[]).map(dbRowToLab)
  }

  const merged = new Map<string, Lab>()
  for (const l of fs_labs) merged.set(l.slug, l)
  for (const l of db_labs) merged.set(l.slug, l)

  return Array.from(merged.values())
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
}

export async function getAllLabMeta(): Promise<LabMeta[]> {
  const labs = await getAllLabs()
  return labs.map(({ content: _c, ...meta }) => meta)
}

export async function getLabBySlug(slug: string): Promise<Lab | undefined> {
  const all = await getAllLabs()
  return all.find(l => l.slug === slug)
}
