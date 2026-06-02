import type { UserProgress } from '@/lib/progress'
import type { LabMeta } from '@/lib/labs'
import type { ArticleMeta } from '@/lib/theme'

interface Props {
  progress: UserProgress
  allLabs: LabMeta[]
  allArticles: ArticleMeta[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: 'v' | 'c' | 'a'
  unlocked: boolean
  progress?: { current: number; target: number }
}

function computeAchievements(p: UserProgress, labs: LabMeta[], articles: ArticleMeta[]): Achievement[] {
  const completedSlugs = new Set(p.labs.filter(l => l.status === 'completed').map(l => l.lab_slug))
  const completedLabs = labs.filter(l => completedSlugs.has(l.slug))
  const completedTags = new Set(completedLabs.map(l => l.tag))
  const completedDifficulties = new Set(completedLabs.map(l => l.difficulty))

  // Séries
  const apiSeries = labs.filter(l => l.series === 'api-securisee-from-zero')
  const apiCompleted = apiSeries.filter(l => completedSlugs.has(l.slug)).length
  const homelabSeries = labs.filter(l => l.series === 'homelab-from-zero')
  const homelabCompleted = homelabSeries.filter(l => completedSlugs.has(l.slug)).length

  const articleReads = p.summary.articles_read
  const labsDone = p.summary.labs_completed

  return [
    {
      id: 'first-lab',
      title: 'Premier pas',
      description: 'Terminer ton tout premier lab',
      icon: '🎯',
      color: 'c',
      unlocked: labsDone >= 1,
    },
    {
      id: 'apprenti',
      title: 'Apprenti',
      description: 'Terminer 3 labs',
      icon: '⚡',
      color: 'v',
      unlocked: labsDone >= 3,
      progress: { current: Math.min(labsDone, 3), target: 3 },
    },
    {
      id: 'praticien',
      title: 'Praticien',
      description: 'Terminer 5 labs',
      icon: '🔧',
      color: 'a',
      unlocked: labsDone >= 5,
      progress: { current: Math.min(labsDone, 5), target: 5 },
    },
    {
      id: 'expert',
      title: 'Expert',
      description: 'Terminer 10 labs',
      icon: '🏆',
      color: 'v',
      unlocked: labsDone >= 10,
      progress: { current: Math.min(labsDone, 10), target: 10 },
    },
    {
      id: 'lecteur',
      title: 'Lecteur assidu',
      description: 'Lire 5 articles',
      icon: '📖',
      color: 'c',
      unlocked: articleReads >= 5,
      progress: { current: Math.min(articleReads, 5), target: 5 },
    },
    {
      id: 'all-tags',
      title: 'Touche-à-tout',
      description: 'Terminer un lab dans chaque rubrique (Infra, Sec, Réseau)',
      icon: '🎨',
      color: 'a',
      unlocked: completedTags.size >= 3,
      progress: { current: completedTags.size, target: 3 },
    },
    {
      id: 'all-difficulty',
      title: 'Polyvalent',
      description: 'Un lab débutant, intermédiaire et avancé complétés',
      icon: '🎚️',
      color: 'v',
      unlocked: completedDifficulties.size >= 3,
      progress: { current: completedDifficulties.size, target: 3 },
    },
    ...(apiSeries.length > 0 ? [{
      id: 'series-api',
      title: 'Architecte API',
      description: `Compléter la série « API sécurisée from zero » (${apiCompleted}/${apiSeries.length})`,
      icon: '🛡️',
      color: 'c' as const,
      unlocked: apiCompleted === apiSeries.length && apiSeries.length > 0,
      progress: { current: apiCompleted, target: apiSeries.length },
    }] : []),
    ...(homelabSeries.length > 0 ? [{
      id: 'series-homelab',
      title: 'Maître du homelab',
      description: `Compléter la série « Homelab from zero » (${homelabCompleted}/${homelabSeries.length})`,
      icon: '🏗️',
      color: 'v' as const,
      unlocked: homelabCompleted === homelabSeries.length && homelabSeries.length > 0,
      progress: { current: homelabCompleted, target: homelabSeries.length },
    }] : []),
    {
      id: 'completionist',
      title: 'Complétiste',
      description: `Terminer tous les labs disponibles (${labsDone}/${labs.length})`,
      icon: '👑',
      color: 'a',
      unlocked: labs.length > 0 && labsDone >= labs.length,
      progress: { current: labsDone, target: labs.length },
    },
  ]
}

export default function AchievementsSection({ progress, allLabs, allArticles }: Props) {
  const achievements = computeAchievements(progress, allLabs, allArticles)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <section className="ac-card" style={{ padding: '30px 30px 26px' }}>
      <style>{`
        .ach-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px; }
        .ach-head-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); }
        .ach-head-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .ach-count { font-family:var(--fm); font-size:11px; letter-spacing:.1em; color:var(--mid); }
        .ach-count b { color:var(--text); font-size:14px; font-family:var(--fd); }

        .ach-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        @media(max-width:600px) { .ach-grid { grid-template-columns:1fr; } }

        .ach-item {
          position:relative;
          padding:14px 16px;
          border:1px solid var(--border);
          border-radius:12px;
          background:rgba(255,255,255,.018);
          display:flex; gap:12px; align-items:flex-start;
          transition: border-color .25s, background .25s, transform .25s;
        }
        .ach-item.unlocked {
          border-color: color-mix(in oklab, var(--ach-c) 35%, var(--border));
          background: color-mix(in oklab, var(--ach-c) 6%, rgba(255,255,255,.018));
        }
        .ach-item.unlocked:hover { transform: translateY(-1px); }
        .ach-item.locked { opacity:.55; }

        .ach-icon {
          width:36px; height:36px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0;
          background: color-mix(in oklab, var(--ach-c) 12%, rgba(255,255,255,.03));
          border:1px solid color-mix(in oklab, var(--ach-c) 25%, var(--border));
          filter: grayscale(0);
        }
        .ach-item.locked .ach-icon { filter: grayscale(1); opacity:.7; }

        .ach-body { flex:1; min-width:0; }
        .ach-title { font-family:var(--fb); font-size:13px; font-weight:600; color:var(--text); display:flex; align-items:center; gap:8px; }
        .ach-title-check { color: var(--ach-c); font-size:11px; }
        .ach-desc { font-size:11.5px; color:var(--dim); margin-top:3px; line-height:1.5; }

        .ach-bar { margin-top:8px; height:3px; background:rgba(255,255,255,.04); border-radius:100px; overflow:hidden; }
        .ach-bar-fill { height:100%; background: var(--ach-c); border-radius:100px; transition: width .6s var(--ease); }
        .ach-progress-text { font-family:var(--fm); font-size:9px; color:var(--dim); margin-top:4px; letter-spacing:.06em; }
      `}</style>

      <div className="ach-head">
        <div>
          <div className="ach-head-label">// succès débloqués</div>
          <div className="ach-head-title">Achievements</div>
        </div>
        <div className="ach-count"><b>{unlockedCount}</b> / {achievements.length}</div>
      </div>

      <div className="ach-grid">
        {achievements.map(a => {
          const colVar = a.color === 'v' ? 'var(--v)' : a.color === 'c' ? 'var(--c)' : 'var(--a)'
          const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : (a.unlocked ? 100 : 0)
          return (
            <div
              key={a.id}
              className={`ach-item ${a.unlocked ? 'unlocked' : 'locked'}`}
              style={{ '--ach-c': colVar } as React.CSSProperties}
            >
              <div className="ach-icon" aria-hidden="true">{a.icon}</div>
              <div className="ach-body">
                <div className="ach-title">
                  {a.title}
                  {a.unlocked && <span className="ach-title-check">✓</span>}
                </div>
                <div className="ach-desc">{a.description}</div>
                {a.progress && !a.unlocked && (
                  <>
                    <div className="ach-bar"><div className="ach-bar-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="ach-progress-text">{a.progress.current} / {a.progress.target}</div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
