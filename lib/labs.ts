import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ArticleTag, ArticleTheme, MinRole } from './theme'

export type LabDifficulty = 'débutant' | 'intermédiaire' | 'avancé'

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

export function getAllLabs(): Lab[] {
  if (!fs.existsSync(LABS_DIR)) return []
  const files = fs.readdirSync(LABS_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
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
        content,
      }
    })
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
}

export function getAllLabMeta(): LabMeta[] {
  return getAllLabs().map(({ content: _c, ...meta }) => meta)
}

export function getLabBySlug(slug: string): Lab | undefined {
  return getAllLabs().find(l => l.slug === slug)
}
