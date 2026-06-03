import type { LabMeta } from './labs'
import type { UserProgress } from './progress'

const DIFFICULTY_ORDER = { 'débutant': 0, 'intermédiaire': 1, 'avancé': 2 } as const

/**
 * Recommande jusqu'à `limit` labs à un user après qu'il vient de terminer `currentSlug`.
 *
 * Stratégie :
 *  1. Suite directe dans la même série (si applicable)
 *  2. Même tag, non démarré, difficulté +1 ou égale
 *  3. Premier lab non démarré dans une nouvelle série
 *  4. Fallback : n'importe quel lab non démarré, trié par difficulté croissante
 */
export function recommendNextLabs(
  currentSlug: string,
  allLabs: LabMeta[],
  progress: UserProgress | null,
  limit = 3,
): LabMeta[] {
  const current = allLabs.find(l => l.slug === currentSlug)
  if (!current) return []

  const completedSlugs = new Set(progress?.labs.filter(l => l.status === 'completed').map(l => l.lab_slug) ?? [])
  const startedSlugs   = new Set(progress?.labs.map(l => l.lab_slug) ?? [])

  const out: LabMeta[] = []
  const taken = new Set<string>([currentSlug])
  const push = (l: LabMeta) => {
    if (taken.has(l.slug) || out.length >= limit) return
    taken.add(l.slug)
    out.push(l)
  }

  // 1. Suite de la série
  if (current.series && typeof current.seriesOrder === 'number') {
    const sameSeries = allLabs
      .filter(l => l.series === current.series && typeof l.seriesOrder === 'number')
      .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
    const next = sameSeries.find(l => (l.seriesOrder ?? 0) > (current.seriesOrder ?? 0) && !completedSlugs.has(l.slug))
    if (next) push(next)
  }

  // 2. Même tag, non démarré, difficulté ≥ current
  const currentDiff = DIFFICULTY_ORDER[current.difficulty]
  const sameTagNext = allLabs
    .filter(l => l.tag === current.tag && !startedSlugs.has(l.slug) && DIFFICULTY_ORDER[l.difficulty] >= currentDiff)
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
  sameTagNext.forEach(push)

  // 3. Première série non démarrée
  const seriesNotStarted = new Map<string, LabMeta>()
  for (const l of allLabs) {
    if (!l.series || startedSlugs.has(l.slug) || completedSlugs.has(l.slug)) continue
    if (seriesNotStarted.has(l.series)) continue
    if ((l.seriesOrder ?? 1) === 1) seriesNotStarted.set(l.series, l)
  }
  for (const l of seriesNotStarted.values()) push(l)

  // 4. Fallback : n'importe quel non démarré, trié par difficulté
  const rest = allLabs
    .filter(l => !startedSlugs.has(l.slug) && !taken.has(l.slug))
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
  rest.forEach(push)

  return out
}
