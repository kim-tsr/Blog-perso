'use client'

import { useRef, useState } from 'react'

interface Props {
  children?: React.ReactNode
}

export default function CodeBlock({ children }: Props) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!ref.current) return
    const text = ref.current.innerText
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore — clipboard may be unavailable in some browsers/contexts
    }
  }

  return (
    <div className="cb-wrap">
      <style>{`
        .cb-wrap { position: relative; }
        .cb-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          font-family: var(--fm);
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(255,255,255,.04);
          color: var(--dim);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: color .2s, background .2s, border-color .2s;
          opacity: 0;
          z-index: 2;
        }
        .cb-wrap:hover .cb-btn,
        .cb-btn:focus-visible { opacity: 1; }
        .cb-btn:hover { color: var(--text); background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.18); }
        .cb-btn.copied { color: var(--c); border-color: color-mix(in oklab, var(--c) 35%, var(--border)); background: color-mix(in oklab, var(--c) 10%, transparent); opacity: 1; }
        @media (pointer: coarse) { .cb-btn { opacity: 1; } }
      `}</style>
      <button
        type="button"
        onClick={handleCopy}
        className={`cb-btn ${copied ? 'copied' : ''}`}
        aria-label={copied ? 'Copié dans le presse-papier' : 'Copier le code'}
      >
        {copied ? '✓ Copié' : 'Copier'}
      </button>
      <pre ref={ref}>{children}</pre>
    </div>
  )
}
