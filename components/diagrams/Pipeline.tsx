interface Step {
  label: string
  hint?: string
  accent?: 'v' | 'c' | 'a' | 's'
}

// On accepte aussi un simple tableau de chaînes : `steps={["Étape 1", "Étape 2"]}`.
// La majorité des labs utilise cette forme courte → on la normalise en Step.
type StepInput = Step | string

interface Props {
  steps: StepInput[]
  caption?: string
}

function toStep(s: StepInput): Step {
  return typeof s === 'string' ? { label: s } : s
}

const ACCENT: Record<NonNullable<Step['accent']>, string> = {
  v: 'var(--v)', c: 'var(--c)', a: 'var(--a)', s: 'var(--s)',
}

/**
 * Pipeline horizontal : étapes linéaires reliées par des flèches.
 * Server component, pure CSS, responsive (passe en vertical sur mobile).
 *
 * Exemple MDX :
 *   <Pipeline steps={[
 *     { label: 'Code',       hint: 'git push', accent: 'v' },
 *     { label: 'Lint',       hint: 'eslint',   accent: 'c' },
 *     { label: 'Tests',      hint: 'jest',     accent: 'a' },
 *     { label: 'Deploy',     hint: 'vercel',   accent: 's' },
 *   ]} caption="Pipeline CI/CD simplifié" />
 */
export default function Pipeline({ steps, caption }: Props) {
  const safeSteps = (Array.isArray(steps) ? steps : []).map(toStep)
  if (safeSteps.length === 0) return null
  return (
    <figure className="pl-fig">
      <style>{`
        .pl-fig { margin: 32px 0; padding: 24px 22px 18px; border: 1px solid var(--border); border-radius: 14px; background: rgba(255,255,255,.02); overflow-x: auto; }
        .pl-row { display: flex; align-items: stretch; gap: 0; min-width: max-content; }
        .pl-step {
          position: relative;
          padding: 18px 22px 18px 36px;
          background: color-mix(in oklab, var(--pl-c) 8%, var(--bg2));
          border: 1px solid color-mix(in oklab, var(--pl-c) 35%, var(--border));
          flex: 1 1 0;
          min-width: 140px;
          display: flex; flex-direction: column; gap: 4px; justify-content: center;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%);
        }
        .pl-step:first-child { padding-left: 22px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%); }
        .pl-step:last-child  { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%); }
        .pl-num { font-family: var(--fm); font-size: 9px; color: var(--pl-c); letter-spacing: 0.16em; text-transform: uppercase; }
        .pl-label { font-family: var(--fd); font-size: 14px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
        .pl-hint { font-family: var(--fm); font-size: 10.5px; color: var(--mid); letter-spacing: 0.04em; }
        .pl-cap {
          margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border);
          font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 0.04em; text-align: center;
        }

        @media (max-width: 720px) {
          .pl-row { flex-direction: column; gap: 8px; min-width: 0; }
          .pl-step { clip-path: none !important; padding: 14px 16px !important; border-radius: 10px; min-width: 0; }
          .pl-step:not(:last-child)::after {
            content: '↓';
            position: absolute; left: 50%; bottom: -10px; transform: translateX(-50%);
            font-size: 14px; color: var(--mid);
          }
        }
      `}</style>
      <div className="pl-row">
        {safeSteps.map((s, i) => (
          <div key={i} className="pl-step" style={{ '--pl-c': ACCENT[s.accent ?? 'v'] } as React.CSSProperties}>
            <span className="pl-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="pl-label">{s.label}</span>
            {s.hint && <span className="pl-hint">{s.hint}</span>}
          </div>
        ))}
      </div>
      {caption && <figcaption className="pl-cap">{caption}</figcaption>}
    </figure>
  )
}
