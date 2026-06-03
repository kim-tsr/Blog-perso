import { Metadata } from 'next'
import Link from 'next/link'
import { getAllLabMeta, type LabMeta } from '@/lib/labs'
import { getUserProgress } from '@/lib/progress'
import { getCurrentProfile, hasRole } from '@/lib/auth'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Carte d'apprentissage — dev.sec.ops",
  description:
    "Visualise le graphe de prérequis de tous les labs DevSecOps. Parcours les séries chaînées par thème, repère ton avancement et planifie la suite.",
}

type Status = 'completed' | 'started' | 'idle' | 'locked'

const THEME_LABEL = {
  Infrastructure: { col: 'var(--v)', code: 'infra',  label: 'Infrastructure' },
  Cybersécurité:  { col: 'var(--c)', code: 'sec',    label: 'Cybersécurité'  },
  Réseau:         { col: 'var(--a)', code: 'reseau', label: 'Réseau'         },
} as const

/* SVG constants */
const NODE_R   = 22   // circle radius
const COL_W    = 340  // SVG column width
const NODE_X   = 48   // circle centre X within the column
const STEP_Y   = 90   // vertical spacing between nodes
const GAP_BETWEEN_SERIES = 40  // extra space between series groups

/* Truncate long titles for SVG text */
function truncate(s: string, max = 32): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/* ---------- node icon & colours per status ---------- */
function nodeStyle(status: Status): {
  circleFill: string
  circleStroke: string
  textFill: string
} {
  switch (status) {
    case 'completed':
      return {
        circleFill:   'color-mix(in oklab, var(--c) 18%, transparent)',
        circleStroke: 'var(--c)',
        textFill:     'var(--text)',
      }
    case 'started':
      return {
        circleFill:   'color-mix(in oklab, var(--v) 12%, transparent)',
        circleStroke: 'var(--v)',
        textFill:     'var(--text)',
      }
    case 'locked':
      return {
        circleFill:   'color-mix(in oklab, var(--a) 10%, transparent)',
        circleStroke: 'var(--a)',
        textFill:     'var(--dim)',
      }
    case 'idle':
    default:
      return {
        circleFill:   'transparent',
        circleStroke: 'var(--border)',
        textFill:     'var(--mid)',
      }
  }
}

function statusIcon(status: Status): string {
  switch (status) {
    case 'completed': return '✓'
    case 'started':   return '◐'
    case 'locked':    return '🔒'
    default:          return ''
  }
}

/* ---------- build SVG for one theme column ---------- */
function buildColumnSvg(
  items: LabMeta[],
  statusFor: (l: LabMeta) => Status,
  themeCol: string,
): { svg: string; height: number } {
  if (items.length === 0) return { svg: '', height: 0 }

  /* group into series + standalone */
  const seriesMap = new Map<string, LabMeta[]>()
  const standalone: LabMeta[] = []
  for (const l of items) {
    if (l.series) {
      const arr = seriesMap.get(l.series) ?? []
      arr.push(l)
      seriesMap.set(l.series, arr)
    } else {
      standalone.push(l)
    }
  }
  // sort each series by seriesOrder
  for (const [key, arr] of seriesMap) {
    seriesMap.set(key, arr.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)))
  }

  /* flatten into positioned items (series label rows + lab nodes) */
  type RowKind =
    | { kind: 'series-label'; text: string; y: number }
    | { kind: 'node'; lab: LabMeta; y: number; isLastInSeries: boolean; isFirstInSeries: boolean; isInSeries: boolean }

  const rows: RowKind[] = []
  let curY = NODE_R + 16 // top padding

  /* series blocks */
  for (const [seriesSlug, labs] of seriesMap) {
    const labelText = seriesSlug
      .replace(/-from-zero$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    rows.push({ kind: 'series-label', text: labelText, y: curY })
    curY += 28
    for (let i = 0; i < labs.length; i++) {
      rows.push({
        kind: 'node',
        lab: labs[i],
        y: curY,
        isFirstInSeries: i === 0,
        isLastInSeries: i === labs.length - 1,
        isInSeries: true,
      })
      curY += STEP_Y
    }
    curY += GAP_BETWEEN_SERIES
  }

  /* standalone block */
  if (standalone.length > 0) {
    rows.push({ kind: 'series-label', text: 'Labs individuels', y: curY })
    curY += 28
    const sorted = [...standalone].sort((a, b) => a.title.localeCompare(b.title))
    for (const l of sorted) {
      rows.push({ kind: 'node', lab: l, y: curY, isFirstInSeries: false, isLastInSeries: false, isInSeries: false })
      curY += STEP_Y
    }
    curY += 20
  }

  const svgHeight = curY + NODE_R

  /* ---- defs: arrowhead marker ---- */
  const defs = `
  <defs>
    <marker id="arr-${themeCol.replace(/[^a-z]/gi,'')}" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="${themeCol}" opacity="0.45" />
    </marker>
    <style>
      .carte-node-circle { transition: transform 0.18s cubic-bezier(0.16,1,0.3,1); transform-origin: center; transform-box: fill-box; }
      .carte-node-circle:hover { transform: scale(1.15); cursor: pointer; }
      .carte-node-group:hover .carte-node-circle { transform: scale(1.15); cursor: pointer; }
    </style>
  </defs>`

  /* ---- arrows between consecutive series nodes ---- */
  const arrowLines: string[] = []
  let prevNode: RowKind | null = null
  for (const row of rows) {
    if (row.kind === 'node') {
      if (prevNode && prevNode.kind === 'node' && prevNode.isInSeries && row.isInSeries && !row.isFirstInSeries) {
        const x1 = NODE_X
        const y1 = prevNode.y + NODE_R + 3
        const y2 = row.y - NODE_R - 3
        const mx = x1
        const my = (y1 + y2) / 2
        arrowLines.push(
          `<path d="M${x1},${y1} C${x1},${my} ${mx},${my} ${x1},${y2}"
            stroke="${themeCol}" stroke-width="1.5" fill="none" opacity="0.45"
            marker-end="url(#arr-${themeCol.replace(/[^a-z]/gi,'')})" />`
        )
      }
      prevNode = row
    } else {
      prevNode = null
    }
  }

  /* ---- nodes & labels ---- */
  const elements: string[] = []
  for (const row of rows) {
    if (row.kind === 'series-label') {
      elements.push(`
        <text x="${NODE_X + NODE_R + 10}" y="${row.y}"
          font-size="9" letter-spacing="0.18em" fill="${themeCol}" opacity="0.7"
          font-family="var(--fm,monospace)" text-anchor="start" text-rendering="geometricPrecision">
          // ${row.text.toUpperCase()}
        </text>`)
      continue
    }

    const { lab, y } = row
    const st = statusFor(lab)
    const style = nodeStyle(st)
    const icon  = statusIcon(st)
    const label = truncate(lab.title)

    elements.push(`
      <a href="/labs/${lab.slug}" class="carte-node-group">
        <title>${lab.title} — ${lab.difficulty} — ${lab.duration}${st === 'locked' ? ' (accès restreint)' : ''}</title>
        <circle
          cx="${NODE_X}" cy="${y}" r="${NODE_R}"
          fill="${style.circleFill}"
          stroke="${style.circleStroke}"
          stroke-width="1.5"
          class="carte-node-circle"
        />
        <text
          x="${NODE_X}" y="${y + 1}"
          font-size="${icon === '🔒' ? '13' : '14'}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="var(--fb,sans-serif)"
          font-weight="700"
          fill="${style.circleStroke}"
          pointer-events="none"
        >${icon}</text>
        <text
          x="${NODE_X + NODE_R + 12}" y="${y - 6}"
          font-size="12.5"
          font-family="var(--fb,sans-serif)"
          font-weight="500"
          fill="${style.textFill}"
          text-rendering="geometricPrecision"
        >${label}</text>
        <text
          x="${NODE_X + NODE_R + 12}" y="${y + 10}"
          font-size="9.5"
          font-family="var(--fm,monospace)"
          letter-spacing="0.06em"
          fill="var(--dim)"
          text-rendering="geometricPrecision"
        >${lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)} · ${lab.duration}</text>
      </a>`)
  }

  const svg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${COL_W}" height="${svgHeight}"
    viewBox="0 0 ${COL_W} ${svgHeight}"
    aria-label="Graphe de dépendances"
    style="overflow:visible"
  >
    ${defs}
    ${arrowLines.join('\n')}
    ${elements.join('\n')}
  </svg>`

  return { svg, height: svgHeight }
}

export default async function CartePage() {
  const [labs, progress, profile] = await Promise.all([
    getAllLabMeta(),
    getUserProgress(),
    getCurrentProfile(),
  ])

  const userRole = profile?.role ?? null
  const completedSlugs = new Set(
    (progress?.labs ?? []).filter(l => l.status === 'completed').map(l => l.lab_slug)
  )
  const startedSlugs = new Set(
    (progress?.labs ?? []).filter(l => l.status === 'started').map(l => l.lab_slug)
  )

  function statusFor(lab: LabMeta): Status {
    if (completedSlugs.has(lab.slug)) return 'completed'
    if (startedSlugs.has(lab.slug))   return 'started'
    if (!hasRole(userRole, lab.minRole)) return 'locked'
    return 'idle'
  }

  /* group by theme */
  const byTheme: Record<keyof typeof THEME_LABEL, LabMeta[]> = {
    Infrastructure: [], Cybersécurité: [], Réseau: [],
  }
  for (const l of labs) {
    const k = l.tag as keyof typeof THEME_LABEL
    if (byTheme[k]) byTheme[k].push(l)
  }

  /* generate SVGs */
  const columns = (Object.keys(THEME_LABEL) as Array<keyof typeof THEME_LABEL>).map(theme => {
    const info = THEME_LABEL[theme]
    const items = byTheme[theme]
    const { svg, height } = buildColumnSvg(items, statusFor, info.col)
    return { theme, info, items, svg, height }
  })

  /* mobile flat list helpers */
  function mobileRows(items: LabMeta[]): Array<{ lab: LabMeta; isSeries: boolean }> {
    const seriesMap = new Map<string, LabMeta[]>()
    const standalone: LabMeta[] = []
    for (const l of items) {
      if (l.series) {
        const arr = seriesMap.get(l.series) ?? []
        arr.push(l); seriesMap.set(l.series, arr)
      } else {
        standalone.push(l)
      }
    }
    const out: Array<{ lab: LabMeta; isSeries: boolean }> = []
    for (const [, arr] of seriesMap) {
      for (const l of arr.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))) {
        out.push({ lab: l, isSeries: true })
      }
    }
    for (const l of [...standalone].sort((a, b) => a.title.localeCompare(b.title))) {
      out.push({ lab: l, isSeries: false })
    }
    return out
  }

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <style>{`
          /* ---------- hero ---------- */
          .cc-hero { padding: 140px 0 50px; position: relative; overflow: hidden; }
          .cc-hero-orb { position: absolute; width: 700px; height: 500px; border-radius: 50%; filter: blur(120px); top: -150px; right: -200px; background: radial-gradient(ellipse, oklch(0.55 0.20 280 / 0.18), transparent 60%); pointer-events: none; }
          .cc-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 48px; position: relative; z-index: 1; }
          @media(max-width:768px) { .cc-hero-inner { padding: 0 24px; } }
          .cc-stag { font-family: var(--fm); font-size: 10px; letter-spacing: .22em; color: var(--v); text-transform: uppercase; margin-bottom: 14px; }
          .cc-title { font-family: var(--fd); font-size: clamp(40px,5.5vw,68px); font-weight: 700; letter-spacing: -.03em; line-height: 1.02; color: var(--text); margin-bottom: 18px; }
          .cc-title b { background: linear-gradient(135deg, var(--v), var(--c), var(--a)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .cc-sub { font-size: 17px; color: var(--mid); font-weight: 300; line-height: 1.6; max-width: 680px; margin-bottom: 34px; }
          .cc-hero-links { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-top: 20px; }
          .cc-hero-link-pill { font-family: var(--fm); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); border: 1px solid var(--border); padding: 6px 14px; border-radius: 100px; transition: color .2s, border-color .2s; }
          .cc-hero-link-pill:hover { color: var(--text); border-color: color-mix(in oklab, var(--v) 50%, var(--border)); }

          /* ---------- legend ---------- */
          .cc-legend { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; margin-top: 28px; }
          .cc-legend-item { display: flex; gap: 8px; align-items: center; font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: .08em; text-transform: uppercase; }
          .cc-legend-dot { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
          .cc-legend-dot.completed { background: color-mix(in oklab, var(--c) 18%, transparent); border: 1.5px solid var(--c); color: var(--c); }
          .cc-legend-dot.started   { background: color-mix(in oklab, var(--v) 12%, transparent); border: 1.5px solid var(--v); color: var(--v); }
          .cc-legend-dot.idle      { background: transparent; border: 1.5px solid var(--border); }
          .cc-legend-dot.locked    { background: color-mix(in oklab, var(--a) 10%, transparent); border: 1.5px solid var(--a); font-size: 10px; }

          /* ---------- signin CTA ---------- */
          .cc-signin-cta { margin-top: 20px; padding: 14px 18px; border: 1px dashed var(--border); border-radius: 12px; font-size: 13px; color: var(--mid); display: inline-flex; align-items: center; gap: 10px; max-width: fit-content; }
          .cc-signin-cta a { color: var(--c); text-decoration: underline; text-decoration-color: rgba(255,255,255,.2); text-underline-offset: 3px; }
          .cc-signin-cta a:hover { color: var(--text); }

          /* ---------- graph area ---------- */
          .cc-graph { max-width: 1200px; margin: 48px auto 80px; padding: 0 48px; }
          @media(max-width:768px) { .cc-graph { padding: 0 24px; } }
          .cc-graph-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
          @media(max-width:1024px) { .cc-graph-grid { grid-template-columns: 1fr; } }

          .cc-col { border: 1px solid var(--border); border-radius: 18px; background: rgba(255,255,255,.018); padding: 28px 22px 28px; position: relative; overflow: hidden; }
          .cc-col::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--col-c), transparent); }
          .cc-col-head { margin-bottom: 22px; }
          .cc-col-label { font-family: var(--fm); font-size: 10px; letter-spacing: .2em; color: var(--col-c); text-transform: uppercase; margin-bottom: 6px; }
          .cc-col-title { font-family: var(--fd); font-size: 20px; font-weight: 700; letter-spacing: -.02em; color: var(--text); }
          .cc-col-count { font-family: var(--fm); font-size: 10px; color: var(--dim); letter-spacing: .1em; margin-top: 4px; }

          /* desktop: SVG wrapper, mobile: hidden */
          .cc-svg-wrap { display: block; }
          .cc-mobile-list { display: none; }
          @media(max-width:768px) {
            .cc-svg-wrap { display: none; }
            .cc-mobile-list { display: flex; flex-direction: column; gap: 4px; }
          }

          /* ---------- mobile list items ---------- */
          .cc-ml-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; transition: background .2s; text-decoration: none; }
          .cc-ml-item:hover { background: rgba(255,255,255,.03); }
          .cc-ml-dot { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; border: 1.5px solid var(--border); background: transparent; }
          .cc-ml-dot.completed { background: color-mix(in oklab, var(--c) 18%, transparent); border-color: var(--c); color: var(--c); }
          .cc-ml-dot.started   { background: color-mix(in oklab, var(--v) 12%, transparent); border-color: var(--v); color: var(--v); }
          .cc-ml-dot.locked    { background: color-mix(in oklab, var(--a) 10%, transparent); border-color: var(--a); font-size: 10px; }
          .cc-ml-content { flex: 1; min-width: 0; }
          .cc-ml-title { font-family: var(--fb); font-size: 13px; color: var(--text); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .cc-ml-title.dim { color: var(--mid); }
          .cc-ml-meta { font-family: var(--fm); font-size: 9.5px; color: var(--dim); letter-spacing: .06em; text-transform: uppercase; margin-top: 2px; }
          .cc-ml-series-line { width: 1.5px; height: 14px; background: var(--col-c); opacity: 0.35; margin-left: 9px; }
          .cc-ml-divider { font-family: var(--fm); font-size: 9px; letter-spacing: .2em; color: var(--col-c); opacity: 0.6; text-transform: uppercase; padding: 6px 0 4px; }
          .cc-ml-empty { font-size: 12.5px; color: var(--dim); text-align: center; padding: 14px 8px; border: 1px dashed var(--border); border-radius: 10px; font-style: italic; }

          /* ---------- SVG link hover effect ---------- */
          .cc-svg-wrap svg a { outline: none; }
          .cc-svg-wrap svg a:hover .carte-node-circle { transform: scale(1.15); }
        `}</style>

        {/* HERO */}
        <section className="cc-hero">
          <div className="cc-hero-orb" aria-hidden="true" />
          <div className="cc-hero-inner">
            <div className="cc-stag">// graphe de dépendances</div>
            <h1 className="cc-title">
              Carte <b>d&apos;apprentissage</b>
            </h1>
            <p className="cc-sub">
              Tous les labs organisés par thème et par série — avec les dépendances entre labs d&apos;une même série. Hover sur un nœud pour voir les détails, clique pour ouvrir le lab.
            </p>

            {/* 4-state legend */}
            <div className="cc-legend" aria-label="Légende des statuts">
              <span className="cc-legend-item">
                <span className="cc-legend-dot completed" aria-hidden="true">✓</span>
                Terminé
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot started" aria-hidden="true">◐</span>
                En cours
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot idle" aria-hidden="true" />
                Disponible
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot locked" aria-hidden="true">🔒</span>
                Restreint
              </span>
            </div>

            <div className="cc-hero-links">
              <Link href="/roadmap" className="cc-hero-link-pill">
                ← Vue parcours
              </Link>
            </div>

            {!profile && (
              <div className="cc-signin-cta">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>
                  <Link href="/auth/signin?next=/parcours/carte">Se connecter</Link> pour suivre ta progression sur cette carte.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* GRAPH COLUMNS */}
        <section className="cc-graph">
          <div className="cc-graph-grid">
            {columns.map(({ theme, info, items, svg, height }) => {
              const mobileItems = mobileRows(items)

              /* group mobile items for divider rendering */
              type MobileGroup = { label: string; rows: Array<{ lab: LabMeta; isSeries: boolean }> }
              const mobileGroups: MobileGroup[] = []
              const seriesKeys: string[] = []
              for (const { lab } of mobileItems) {
                if (lab.series && !seriesKeys.includes(lab.series)) seriesKeys.push(lab.series)
              }
              for (const sk of seriesKeys) {
                mobileGroups.push({
                  label: sk.replace(/-from-zero$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  rows: mobileItems.filter(r => r.lab.series === sk),
                })
              }
              const standaloneGroup: MobileGroup = {
                label: 'Labs individuels',
                rows: mobileItems.filter(r => !r.lab.series),
              }
              if (standaloneGroup.rows.length > 0) mobileGroups.push(standaloneGroup)

              return (
                <div
                  key={theme}
                  className="cc-col"
                  style={{ '--col-c': info.col } as React.CSSProperties}
                >
                  <div className="cc-col-head">
                    <div className="cc-col-label">// {info.code}</div>
                    <div className="cc-col-title">{info.label}</div>
                    <div className="cc-col-count">{items.length} lab{items.length !== 1 ? 's' : ''}</div>
                  </div>

                  {/* DESKTOP: SVG graph */}
                  {svg ? (
                    <div
                      className="cc-svg-wrap"
                      style={{ minHeight: height }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ) : (
                    <div className="cc-svg-wrap" style={{ padding: '14px 8px', textAlign: 'center', fontSize: 12.5, color: 'var(--dim)', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: 10 }}>
                      Pas encore de lab dans ce thème.
                    </div>
                  )}

                  {/* MOBILE: flat list */}
                  <div className="cc-mobile-list">
                    {mobileGroups.length === 0 && (
                      <div className="cc-ml-empty">Pas encore de lab dans ce thème.</div>
                    )}
                    {mobileGroups.map((group, gi) => (
                      <div key={group.label}>
                        <div className="cc-ml-divider">// {group.label}</div>
                        {group.rows.map(({ lab, isSeries }, idx) => {
                          const st = statusFor(lab)
                          const isNotLast = isSeries && idx < group.rows.length - 1
                          return (
                            <div key={lab.slug}>
                              <Link href={`/labs/${lab.slug}`} className="cc-ml-item">
                                <span className={`cc-ml-dot ${st}`} aria-label={st}>
                                  {statusIcon(st)}
                                </span>
                                <span className="cc-ml-content">
                                  <span className={`cc-ml-title ${st === 'locked' ? 'dim' : ''}`}>
                                    {lab.title}
                                  </span>
                                  <span className="cc-ml-meta">
                                    {lab.difficulty} · {lab.duration}
                                  </span>
                                </span>
                              </Link>
                              {isNotLast && <div className="cc-ml-series-line" aria-hidden="true" />}
                            </div>
                          )
                        })}
                        {gi < mobileGroups.length - 1 && (
                          <div style={{ height: 8 }} aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>
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
