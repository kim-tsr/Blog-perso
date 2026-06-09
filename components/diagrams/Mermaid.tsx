'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface Props {
  chart: string
  caption?: string
}

/**
 * Mermaid diagram rendered client-side, with a theme that matches dev.sec.ops.
 * Lazy-imports mermaid (~150 KB) only when the component mounts.
 * Re-renders on theme change (dark <-> light).
 */
export default function Mermaid({ chart, caption }: Props) {
  const id = useId().replace(/[:]/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const m = await import('mermaid')
        const mermaid = m.default

        const isLight = typeof document !== 'undefined'
          && document.documentElement.getAttribute('data-theme') === 'light'

        const cs = typeof window !== 'undefined'
          ? getComputedStyle(document.documentElement)
          : null

        const v = cs?.getPropertyValue('--v').trim() || '#9b7cff'
        const c = cs?.getPropertyValue('--c').trim() || '#5fd1cf'
        const a = cs?.getPropertyValue('--a').trim() || '#e9a45c'
        const s = cs?.getPropertyValue('--s').trim() || '#e070b8'
        const bg = cs?.getPropertyValue('--bg').trim() || (isLight ? '#f9f7f3' : '#07070c')
        const bg2 = cs?.getPropertyValue('--bg2').trim() || (isLight ? '#f1ede6' : '#0c0c15')
        const text = cs?.getPropertyValue('--text').trim() || (isLight ? '#1a1620' : '#ede9ff')
        const mid = cs?.getPropertyValue('--mid').trim() || (isLight ? '#4a4555' : '#9e9ab8')
        const border = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)'

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'strict',
          fontFamily: 'Space Mono, monospace',
          themeVariables: {
            background: bg,
            primaryColor: bg2,
            primaryTextColor: text,
            primaryBorderColor: v,
            secondaryColor: bg2,
            secondaryTextColor: text,
            secondaryBorderColor: c,
            tertiaryColor: bg2,
            tertiaryTextColor: text,
            tertiaryBorderColor: a,
            lineColor: mid,
            textColor: text,
            mainBkg: bg2,
            nodeBorder: border,
            clusterBkg: 'transparent',
            clusterBorder: border,
            edgeLabelBackground: bg,
            actorBkg: bg2,
            actorBorder: v,
            actorTextColor: text,
            signalColor: mid,
            signalTextColor: text,
            labelBoxBkgColor: bg2,
            labelBoxBorderColor: border,
            noteBkgColor: 'color-mix(in oklab, ' + a + ' 18%, transparent)',
            noteBorderColor: a,
            noteTextColor: text,
            classText: text,
            // semantic accents for our four themes
            cScale0: v, cScale1: c, cScale2: a, cScale3: s,
          },
        })

        const result = await mermaid.render(`mmd-${id}`, chart.trim())
        if (!cancelled) setSvg(result.svg)
      } catch (e) {
        if (!cancelled) setError((e as Error).message || 'Erreur de rendu Mermaid')
      }
    }

    render()

    const onThemeChange = () => render()
    window.addEventListener('themechange', onThemeChange)
    return () => {
      cancelled = true
      window.removeEventListener('themechange', onThemeChange)
    }
  }, [chart, id])

  return (
    <figure className="mm-fig">
      <style>{`
        .mm-fig {
          margin: 32px 0;
          padding: 24px 22px 18px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: linear-gradient(180deg, color-mix(in oklab, var(--v) 4%, transparent), transparent);
          overflow-x: auto;
        }
        .mm-fig svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
        .mm-cap {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed var(--border);
          font-family: var(--fm);
          font-size: 11px;
          color: var(--dim);
          letter-spacing: 0.04em;
          text-align: center;
        }
        .mm-err {
          font-family: var(--fm);
          font-size: 12px;
          color: oklch(0.70 0.18 25);
          padding: 10px;
        }
      `}</style>
      {error && <div className="mm-err">{`// ${error}`}</div>}
      {svg && (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {caption && <figcaption className="mm-cap">{caption}</figcaption>}
    </figure>
  )
}
