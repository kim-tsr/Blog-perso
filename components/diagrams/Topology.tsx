interface Node {
  id: string
  label: string
  /** rôle visuel : 'host', 'service', 'db', 'edge', 'cloud' */
  kind?: 'host' | 'service' | 'db' | 'edge' | 'cloud' | 'user'
  accent?: 'v' | 'c' | 'a' | 's'
  /** Position dans la grille — col/row à partir de 1 */
  col: number
  row: number
}

interface Edge {
  from: string
  to:   string
  label?: string
  /** 'flow' = flèche pleine, 'data' = pointillé, 'sync' = trait épais */
  kind?: 'flow' | 'data' | 'sync'
}

interface Props {
  nodes:   Node[]
  edges:   Edge[]
  cols?:   number   // nombre de colonnes (défaut: max des col déclarés)
  rows?:   number
  caption?: string
}

const ACCENT: Record<NonNullable<Node['accent']>, string> = {
  v: 'var(--v)', c: 'var(--c)', a: 'var(--a)', s: 'var(--s)',
}

/* Icônes vectoriels par kind */
const ICONS: Record<NonNullable<Node['kind']>, React.ReactElement> = {
  host: (
    <g><rect x="-16" y="-12" width="32" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
       <line x1="-12" y1="-6" x2="12" y2="-6" stroke="currentColor" strokeWidth="1"/>
       <line x1="-12" y1="-2" x2="6"  y2="-2" stroke="currentColor" strokeWidth="1"/></g>
  ),
  service: (
    <g><circle r="13" fill="none" stroke="currentColor" strokeWidth="1.5"/>
       <text x="0" y="3" fontSize="9" textAnchor="middle" fill="currentColor" fontFamily="monospace">·</text>
       <circle r="4" cx="0" cy="0" fill="currentColor"/></g>
  ),
  db: (
    <g><ellipse cx="0" cy="-8" rx="14" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
       <path d="M -14 -8 L -14 8 A 14 4 0 0 0 14 8 L 14 -8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
       <ellipse cx="0" cy="0" rx="14" ry="4" fill="none" stroke="currentColor" strokeWidth="1"/></g>
  ),
  edge: (
    <g><polygon points="-14,0 0,-12 14,0 0,12" fill="none" stroke="currentColor" strokeWidth="1.5"/></g>
  ),
  cloud: (
    <g><path d="M -16 4 A 8 8 0 0 1 -10 -8 A 10 10 0 0 1 8 -10 A 6 6 0 0 1 16 0 A 5 5 0 0 1 14 8 L -12 8 A 6 6 0 0 1 -16 4 Z" fill="none" stroke="currentColor" strokeWidth="1.5"/></g>
  ),
  user: (
    <g><circle cx="0" cy="-5" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
       <path d="M -10 12 A 10 8 0 0 1 10 12" fill="none" stroke="currentColor" strokeWidth="1.5"/></g>
  ),
}

/**
 * Topologie réseau / système : nœuds positionnés sur une grille, arêtes orientées.
 *
 * Server component, pur SVG, zéro JS, theme-aware via CSS vars.
 *
 * Exemple MDX :
 *   <Topology
 *     nodes={[
 *       { id: 'u', kind: 'user',    label: 'Client',  col: 1, row: 1, accent: 'v' },
 *       { id: 'p', kind: 'edge',    label: 'nginx',   col: 2, row: 1, accent: 'a' },
 *       { id: 'a', kind: 'service', label: 'API',     col: 3, row: 1, accent: 'c' },
 *       { id: 'd', kind: 'db',      label: 'Postgres',col: 3, row: 2, accent: 's' },
 *     ]}
 *     edges={[
 *       { from: 'u', to: 'p', kind: 'flow', label: 'TLS' },
 *       { from: 'p', to: 'a', kind: 'flow' },
 *       { from: 'a', to: 'd', kind: 'data' },
 *     ]}
 *   />
 */
export default function Topology({ nodes, edges, cols, rows, caption }: Props) {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const safeEdges = Array.isArray(edges) ? edges : []
  if (safeNodes.length === 0) return null
  const C = cols ?? Math.max(1, ...safeNodes.map(n => n.col))
  const R = rows ?? Math.max(1, ...safeNodes.map(n => n.row))

  // SVG dimensions
  const CELL_W = 140
  const CELL_H = 110
  const PAD = 30
  const W = C * CELL_W + 2 * PAD
  const H = R * CELL_H + 2 * PAD

  const center = (col: number, row: number) => ({
    x: PAD + CELL_W * (col - 0.5),
    y: PAD + CELL_H * (row - 0.5),
  })

  const byId = new Map(safeNodes.map(n => [n.id, n]))

  return (
    <figure className="tp-fig">
      <style>{`
        .tp-fig { margin: 32px 0; padding: 24px 22px 18px; border: 1px solid var(--border); border-radius: 14px; background: rgba(255,255,255,.02); overflow-x: auto; }
        .tp-svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
        .tp-node-bg { fill: var(--bg2); }
        .tp-node-label { font-family: var(--fb); font-size: 12px; fill: var(--text); font-weight: 500; }
        .tp-edge-label { font-family: var(--fm); font-size: 10px; fill: var(--mid); letter-spacing: 0.04em; }
        .tp-cap { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border); font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 0.04em; text-align: center; }
      `}</style>
      <svg className="tp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption ?? 'Topologie'}>
        <defs>
          <marker id="tp-arrow-flow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--mid)" />
          </marker>
          <marker id="tp-arrow-data" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 2 L 10 5 L 0 8 z" fill="none" stroke="var(--mid)" strokeWidth="1.2" />
          </marker>
        </defs>

        {safeEdges.map((e, i) => {
          const a = byId.get(e.from)
          const b = byId.get(e.to)
          if (!a || !b) return null
          const pA = center(a.col, a.row)
          const pB = center(b.col, b.row)
          const mx = (pA.x + pB.x) / 2
          const my = (pA.y + pB.y) / 2

          const stroke = 'var(--mid)'
          const dash = e.kind === 'data' ? '4 4' : undefined
          const width = e.kind === 'sync' ? 2 : 1.3
          const marker = e.kind === 'data' ? 'url(#tp-arrow-data)' : 'url(#tp-arrow-flow)'

          return (
            <g key={i}>
              <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y}
                    stroke={stroke} strokeWidth={width} strokeDasharray={dash}
                    markerEnd={marker} />
              {e.label && (
                <text className="tp-edge-label" x={mx} y={my - 6} textAnchor="middle">{e.label}</text>
              )}
            </g>
          )
        })}

        {safeNodes.map(n => {
          const p = center(n.col, n.row)
          const col = ACCENT[n.accent ?? 'v']
          const kind = n.kind ?? 'service'
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y})`} style={{ color: col }}>
              <circle r="28" className="tp-node-bg" stroke={col} strokeWidth="1.4" />
              <g transform="translate(0,-2)">{ICONS[kind]}</g>
              <text className="tp-node-label" y="42" textAnchor="middle">{n.label}</text>
            </g>
          )
        })}
      </svg>
      {caption && <figcaption className="tp-cap">{caption}</figcaption>}
    </figure>
  )
}
