interface Layer {
  label: string
  hint?: string
  accent?: 'v' | 'c' | 'a' | 's' | 'dim'
}

interface Props {
  layers: Layer[]
  caption?: string
  /** Direction d'empilement. 'down' = la couche [0] est en bas (ex: hardware → app). 'up' = la couche [0] est en haut. */
  bottom?: 'first' | 'last'
}

const ACCENT: Record<NonNullable<Layer['accent']>, string> = {
  v: 'var(--v)', c: 'var(--c)', a: 'var(--a)', s: 'var(--s)', dim: 'var(--dim)',
}

/**
 * Diagramme empilé : couches verticales représentant une pile logicielle / OS / réseau.
 * Server component, zéro JS, SVG-friendly via flexbox.
 *
 * Exemple MDX :
 *   <Stack layers={[
 *     { label: 'Application',  accent: 'v' },
 *     { label: 'Container runtime', hint: 'runc / crun', accent: 'c' },
 *     { label: 'Kernel Linux', hint: 'cgroups + namespaces', accent: 's' },
 *     { label: 'Hardware',     accent: 'dim' },
 *   ]} caption="Pile typique d'un workload conteneurisé" />
 */
export default function Stack({ layers, caption, bottom = 'last' }: Props) {
  const safeLayers = Array.isArray(layers) ? layers : []
  if (safeLayers.length === 0) return null
  const items = bottom === 'last' ? safeLayers : [...safeLayers].reverse()

  return (
    <figure className="stk-fig">
      <style>{`
        .stk-fig { margin: 32px 0; padding: 24px 22px; border: 1px solid var(--border); border-radius: 14px; background: rgba(255,255,255,.02); }
        .stk-wrap { display: flex; flex-direction: column; gap: 6px; max-width: 540px; margin: 0 auto; }
        .stk-row {
          position: relative;
          padding: 18px 22px;
          border: 1px solid var(--stk-c);
          border-radius: 10px;
          background: linear-gradient(135deg, color-mix(in oklab, var(--stk-c) 14%, transparent), color-mix(in oklab, var(--stk-c) 6%, transparent));
          display: flex; align-items: center; justify-content: space-between; gap: 18px;
        }
        .stk-label { font-family: var(--fd); font-size: 15px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
        .stk-hint  { font-family: var(--fm); font-size: 11px; color: var(--mid); letter-spacing: 0.04em; }
        .stk-cap {
          margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border);
          font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 0.04em; text-align: center;
        }
        @media (max-width: 540px) {
          .stk-row { flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px 16px; }
          .stk-hint { font-size: 10px; }
        }
      `}</style>
      <div className="stk-wrap">
        {items.map((l, i) => (
          <div key={i} className="stk-row" style={{ '--stk-c': ACCENT[l.accent ?? 'dim'] } as React.CSSProperties}>
            <span className="stk-label">{l.label}</span>
            {l.hint && <span className="stk-hint">{l.hint}</span>}
          </div>
        ))}
      </div>
      {caption && <figcaption className="stk-cap">{caption}</figcaption>}
    </figure>
  )
}
