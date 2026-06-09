import { Metadata } from 'next'
import Link from 'next/link'
import { getAllLabMeta, type LabMeta, type LabDifficulty } from '@/lib/labs'
import { getUserProgress } from '@/lib/progress'
import { getCurrentProfile, hasRole } from '@/lib/auth'
import { createPublicClient } from '@/lib/supabase/service'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Parcours — dev.sec.ops',
  description: "Ta carte d'apprentissage DevSecOps. Suis ta progression par thème, par série et par niveau de difficulté.",
}

type Status = 'completed' | 'started' | 'idle' | 'locked'

const THEME_LABEL = {
  Infrastructure: { col: 'var(--v)', code: 'infra',    label: 'Infrastructure' },
  Cybersécurité:  { col: 'var(--c)', code: 'sec',      label: 'Cybersécurité'  },
  Réseau:         { col: 'var(--a)', code: 'reseau',   label: 'Réseau'         },
  Systèmes:       { col: 'var(--s)', code: 'systemes', label: 'Systèmes'       },
} as const

const DIFF_ORDER: Record<LabDifficulty, number> = { 'débutant': 0, 'intermédiaire': 1, 'avancé': 2 }

interface SeriesInfo { slug: string; title: string; description: string; theme: 'v' | 'c' | 'a' | 's' }

async function getSeriesInfo(): Promise<Map<string, SeriesInfo>> {
  const supabase = createPublicClient()
  if (!supabase) return new Map()
  const { data } = await supabase.from('lab_series').select('slug, title, description, theme')
  return new Map((data ?? []).map((r: SeriesInfo) => [r.slug, r]))
}

export default async function RoadmapPage() {
  const [labs, progress, profile, seriesInfo] = await Promise.all([
    getAllLabMeta(),
    getUserProgress(),
    getCurrentProfile(),
    getSeriesInfo(),
  ])

  const userRole = profile?.role ?? null
  const completedSlugs = new Set((progress?.labs ?? []).filter(l => l.status === 'completed').map(l => l.lab_slug))
  const startedSlugs   = new Set((progress?.labs ?? []).filter(l => l.status === 'started').map(l => l.lab_slug))

  function statusFor(lab: LabMeta): Status {
    if (completedSlugs.has(lab.slug)) return 'completed'
    if (startedSlugs.has(lab.slug))   return 'started'
    if (!hasRole(userRole, lab.minRole)) return 'locked'
    return 'idle'
  }

  const byTheme: Record<keyof typeof THEME_LABEL, LabMeta[]> = {
    'Infrastructure': [], 'Cybersécurité': [], 'Réseau': [], 'Systèmes': [],
  }
  for (const l of labs) {
    const k = l.tag as keyof typeof THEME_LABEL
    if (byTheme[k]) byTheme[k].push(l)
  }

  const themeStats = (Object.keys(byTheme) as Array<keyof typeof THEME_LABEL>).map(k => {
    const arr = byTheme[k]
    const done = arr.filter(l => completedSlugs.has(l.slug)).length
    const inprog = arr.filter(l => startedSlugs.has(l.slug)).length
    const pct = arr.length > 0 ? Math.round((done / arr.length) * 100) : 0
    return { theme: k, total: arr.length, done, inprog, pct, info: THEME_LABEL[k] }
  })

  const totalDone = completedSlugs.size
  const totalLabs = labs.length
  const overallPct = totalLabs > 0 ? Math.round((totalDone / totalLabs) * 100) : 0

  function nextRecommendation(): LabMeta | null {
    const seriesMap = new Map<string, LabMeta[]>()
    for (const l of labs) {
      if (!l.series) continue
      const arr = seriesMap.get(l.series) ?? []
      arr.push(l); seriesMap.set(l.series, arr)
    }
    for (const [, items] of seriesMap.entries()) {
      const sorted = [...items].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
      const hasProgress = sorted.some(l => completedSlugs.has(l.slug) || startedSlugs.has(l.slug))
      if (!hasProgress) continue
      const next = sorted.find(l => !completedSlugs.has(l.slug) && hasRole(userRole, l.minRole))
      if (next) return next
    }
    const sortedThemes = [...themeStats].sort((a, b) => a.pct - b.pct)
    for (const t of sortedThemes) {
      const candidates = byTheme[t.theme]
        .filter(l => !completedSlugs.has(l.slug) && !startedSlugs.has(l.slug) && hasRole(userRole, l.minRole))
        .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
      if (candidates.length) return candidates[0]
    }
    return null
  }
  const recommended = nextRecommendation()

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <style>{`
          .rd-hero { padding:140px 0 50px; position:relative; overflow:hidden; }
          .rd-hero-orb { position:absolute; width:700px; height:500px; border-radius:50%; filter:blur(120px); top:-150px; right:-200px; background:radial-gradient(ellipse, oklch(0.55 0.20 240/.18), transparent 60%); pointer-events:none; }
          .rd-hero-inner { max-width:1200px; margin:0 auto; padding:0 48px; position:relative; z-index:1; }
          @media(max-width:768px) { .rd-hero-inner { padding:0 24px; } }
          .rd-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--c); text-transform:uppercase; margin-bottom:14px; }
          .rd-stag-wrap { display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:14px; }
          .rd-stag-link { font-family:var(--fm); font-size:10px; letter-spacing:.14em; color:var(--dim); border:1px solid var(--border); padding:4px 12px; border-radius:100px; text-transform:uppercase; transition:color .2s, border-color .2s; white-space:nowrap; }
          .rd-stag-link:hover { color:var(--text); border-color:color-mix(in oklab, var(--v) 50%, var(--border)); }
          .rd-title { font-family:var(--fd); font-size:clamp(40px,5.5vw,68px); font-weight:700; letter-spacing:-.03em; line-height:1.02; color:var(--text); margin-bottom:18px; }
          .rd-title b { background:linear-gradient(135deg,var(--v),var(--c),var(--a)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
          .rd-sub { font-size:17px; color:var(--mid); font-weight:300; line-height:1.6; max-width:680px; margin-bottom:34px; }

          .rd-overall { display:flex; align-items:center; gap:24px; margin-top:8px; max-width:680px; flex-wrap:wrap; }
          .rd-overall-meta { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.14em; text-transform:uppercase; }
          .rd-overall-meta b { color:var(--text); font-family:var(--fd); font-size:18px; letter-spacing:-.01em; }
          .rd-overall-bar { flex:1; min-width:260px; height:8px; background:rgba(255,255,255,.04); border-radius:100px; overflow:hidden; position:relative; }
          .rd-overall-bar-fill { height:100%; background:linear-gradient(90deg, var(--v), var(--c), var(--a)); border-radius:100px; transition:width .8s var(--ease); position:relative; }

          .rd-signin-cta { margin-top:20px; padding:14px 18px; border:1px dashed var(--border); border-radius:12px; font-size:13px; color:var(--mid); display:inline-flex; align-items:center; gap:10px; max-width:fit-content; }
          .rd-signin-cta a { color:var(--c); text-decoration:underline; text-decoration-color:rgba(255,255,255,.2); text-underline-offset:3px; }
          .rd-signin-cta a:hover { color:var(--text); }

          .rd-reco { max-width:1200px; margin:36px auto 0; padding:0 48px; }
          @media(max-width:768px) { .rd-reco { padding:0 24px; } }
          .rd-reco-card { padding:24px 26px; border:1px solid color-mix(in oklab, var(--c) 30%, var(--border)); border-radius:14px; background:linear-gradient(135deg, color-mix(in oklab, var(--c) 8%, transparent), transparent 60%); display:flex; gap:22px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
          .rd-reco-l { display:flex; flex-direction:column; gap:6px; flex:1; min-width:280px; }
          .rd-reco-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--c); }
          .rd-reco-title { font-family:var(--fd); font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
          .rd-reco-meta { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.08em; text-transform:uppercase; display:flex; gap:14px; flex-wrap:wrap; }
          .rd-reco-btn { padding:11px 22px; border-radius:100px; background:var(--c); color:var(--bg); font-family:var(--fb); font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:8px; transition:transform .2s; }
          .rd-reco-btn:hover { transform:translateX(3px); }

          .rd-themes { max-width:1200px; margin:56px auto 80px; padding:0 48px; }
          @media(max-width:768px) { .rd-themes { padding:0 24px; } }
          .rd-themes-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
          @media(max-width:1024px) { .rd-themes-grid { grid-template-columns:1fr; gap:18px; } }

          .rd-col { border:1px solid var(--border); border-radius:18px; background:rgba(255,255,255,.018); padding:28px 26px; display:flex; flex-direction:column; gap:22px; position:relative; overflow:hidden; }
          .rd-col::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, transparent, var(--col-c), transparent); }
          .rd-col-head { display:flex; justify-content:space-between; align-items:flex-end; gap:14px; }
          .rd-col-label { font-family:var(--fm); font-size:10px; letter-spacing:.2em; color:var(--col-c); text-transform:uppercase; margin-bottom:6px; }
          .rd-col-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
          .rd-col-pct { font-family:var(--fd); font-size:28px; font-weight:700; color:var(--col-c); line-height:1; letter-spacing:-.02em; }
          .rd-col-pct small { font-size:14px; color:var(--dim); margin-left:2px; font-weight:500; }
          .rd-col-progress { height:5px; background:rgba(255,255,255,.04); border-radius:100px; overflow:hidden; }
          .rd-col-progress-fill { height:100%; background:var(--col-c); border-radius:100px; transition:width .8s var(--ease); }
          .rd-col-stats { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.1em; display:flex; gap:14px; }
          .rd-col-stats b { color:var(--text); font-family:var(--fd); font-size:14px; }

          .rd-section-label { font-family:var(--fm); font-size:9.5px; letter-spacing:.22em; color:var(--dim); text-transform:uppercase; margin-bottom:10px; margin-top:6px; }
          .rd-series { padding:14px 14px 12px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.018); margin-bottom:10px; }
          .rd-series-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; }
          .rd-series-name { font-family:var(--fd); font-size:13px; font-weight:600; color:var(--text); }
          .rd-series-count { font-family:var(--fm); font-size:10px; color:var(--col-c); letter-spacing:.08em; }
          .rd-series-bar { height:3px; background:rgba(255,255,255,.04); border-radius:100px; overflow:hidden; margin-bottom:10px; }
          .rd-series-bar-fill { height:100%; background:var(--col-c); border-radius:100px; transition:width .8s var(--ease); }

          .rd-lab { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; transition:background .2s; }
          .rd-lab:hover { background:rgba(255,255,255,.03); }
          .rd-lab-status { width:18px; height:18px; border-radius:50%; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; border:1px solid var(--border); background:rgba(255,255,255,.02); }
          .rd-lab-status.completed { background:var(--col-c); color:var(--bg); border-color:var(--col-c); }
          .rd-lab-status.started { background:color-mix(in oklab, var(--a) 22%, transparent); color:var(--a); border-color:color-mix(in oklab, var(--a) 50%, var(--border)); }
          .rd-lab-status.locked { color:var(--dim); }
          .rd-lab-title { font-family:var(--fb); font-size:12.5px; color:var(--text); flex:1; line-height:1.35; }
          .rd-lab-title.dim { color:var(--mid); }
          .rd-lab-meta { font-family:var(--fm); font-size:9px; color:var(--dim); letter-spacing:.06em; text-transform:uppercase; flex-shrink:0; }
          .rd-empty { font-size:12.5px; color:var(--dim); text-align:center; padding:14px 8px; border:1px dashed var(--border); border-radius:10px; font-style:italic; }
        `}</style>

        <section className="rd-hero">
          <div className="rd-hero-orb" aria-hidden="true" />
          <div className="rd-hero-inner">
            <div className="rd-stag-wrap">
              <div className="rd-stag">// ton parcours</div>
              <Link href="/parcours/carte" className="rd-stag-link">
                Voir la carte de dépendances →
              </Link>
            </div>
            <h1 className="rd-title">Carte d&apos;<b>apprentissage</b></h1>
            <p className="rd-sub">
              Une vue d&apos;ensemble des labs disponibles, regroupés par thème et par série. Connecte-toi pour suivre tes progrès individuels — chaque lab terminé est marqué automatiquement.
            </p>

            <div className="rd-overall">
              <span className="rd-overall-meta"><b>{totalDone}</b>&nbsp;/&nbsp;{totalLabs}&nbsp;&nbsp;labs terminés</span>
              <div className="rd-overall-bar">
                <div className="rd-overall-bar-fill" style={{ width: `${overallPct}%` }} />
              </div>
              <span className="rd-overall-meta">{overallPct}%</span>
            </div>

            {!profile && (
              <div className="rd-signin-cta">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <span>
                  <Link href="/auth/signin?next=/roadmap">Connecte-toi</Link> pour suivre ta progression sur cette page.
                </span>
              </div>
            )}
          </div>
        </section>

        {recommended && (
          <div className="rd-reco">
            <div className="rd-reco-card">
              <div className="rd-reco-l">
                <div className="rd-reco-label">// recommandé pour la suite</div>
                <div className="rd-reco-title">{recommended.title}</div>
                <div className="rd-reco-meta">
                  <span>{recommended.tag}</span>
                  <span>·</span>
                  <span>{recommended.difficulty}</span>
                  <span>·</span>
                  <span>{recommended.duration}</span>
                </div>
              </div>
              <Link href={`/labs/${recommended.slug}`} className="rd-reco-btn">
                Démarrer
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        )}

        <section className="rd-themes">
          <div className="rd-themes-grid">
            {themeStats.map(t => {
              const items = byTheme[t.theme]
              const seriesGroups = new Map<string, LabMeta[]>()
              const standalone: LabMeta[] = []
              for (const l of items) {
                if (l.series) {
                  const arr = seriesGroups.get(l.series) ?? []
                  arr.push(l); seriesGroups.set(l.series, arr)
                } else {
                  standalone.push(l)
                }
              }
              const sortedSeries = Array.from(seriesGroups.entries())
                .map(([slug, arr]) => ({
                  slug,
                  info: seriesInfo.get(slug) ?? { slug, title: slug, description: '', theme: 'v' as const },
                  labs: arr.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)),
                }))
              const sortedStandalone = standalone.sort((a, b) =>
                DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] || a.title.localeCompare(b.title)
              )

              return (
                <div key={t.theme} className="rd-col" style={{ '--col-c': t.info.col } as React.CSSProperties}>
                  <div>
                    <div className="rd-col-head">
                      <div>
                        <div className="rd-col-label">// {t.info.code}</div>
                        <div className="rd-col-title">{t.info.label}</div>
                      </div>
                      <div className="rd-col-pct">{t.pct}<small>%</small></div>
                    </div>
                    <div className="rd-col-stats" style={{ marginTop: 12, marginBottom: 10 }}>
                      <span><b>{t.done}</b> terminés</span>
                      {t.inprog > 0 && <span><b>{t.inprog}</b> en cours</span>}
                      <span><b>{t.total}</b> total</span>
                    </div>
                    <div className="rd-col-progress">
                      <div className="rd-col-progress-fill" style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>

                  {sortedSeries.length > 0 && (
                    <div>
                      <div className="rd-section-label">// séries chaînées</div>
                      {sortedSeries.map(s => {
                        const done = s.labs.filter(l => completedSlugs.has(l.slug)).length
                        const pct = Math.round((done / s.labs.length) * 100)
                        return (
                          <div key={s.slug} className="rd-series">
                            <div className="rd-series-head">
                              <div className="rd-series-name">{s.info.title}</div>
                              <div className="rd-series-count">{done}/{s.labs.length}</div>
                            </div>
                            <div className="rd-series-bar"><div className="rd-series-bar-fill" style={{ width: `${pct}%` }} /></div>
                            {s.labs.map(l => {
                              const st = statusFor(l)
                              return (
                                <Link key={l.slug} href={`/labs/${l.slug}`} className="rd-lab">
                                  <span className={`rd-lab-status ${st}`} aria-label={st}>
                                    {st === 'completed' ? '✓' : st === 'started' ? '◐' : st === 'locked' ? '🔒' : ''}
                                  </span>
                                  <span className={`rd-lab-title ${st === 'locked' ? 'dim' : ''}`}>{l.title}</span>
                                  <span className="rd-lab-meta">{l.duration}</span>
                                </Link>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {sortedStandalone.length > 0 ? (
                    <div>
                      <div className="rd-section-label">// labs individuels</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sortedStandalone.map(l => {
                          const st = statusFor(l)
                          return (
                            <Link key={l.slug} href={`/labs/${l.slug}`} className="rd-lab">
                              <span className={`rd-lab-status ${st}`} aria-label={st}>
                                {st === 'completed' ? '✓' : st === 'started' ? '◐' : st === 'locked' ? '🔒' : ''}
                              </span>
                              <span className={`rd-lab-title ${st === 'locked' ? 'dim' : ''}`}>{l.title}</span>
                              <span className="rd-lab-meta">{l.difficulty.charAt(0).toUpperCase()}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : items.length === 0 && (
                    <div className="rd-empty">Pas encore de lab dans ce thème.</div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
