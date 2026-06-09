'use client'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'system' | 'dark'

const OPTIONS: { value: ThemeMode; ariaLabel: string }[] = [
  { value: 'light',  ariaLabel: 'Mode clair' },
  { value: 'system', ariaLabel: 'Mode système' },
  { value: 'dark',   ariaLabel: 'Mode sombre' },
]

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  const common = {
    width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (mode === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </svg>
  )
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.dataset.themeMode = mode
  window.dispatchEvent(new Event('themechange'))
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as ThemeMode | null) ?? 'system'
    setMode(stored)
    applyTheme(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (mode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode, mounted])

  const handleSelect = (next: ThemeMode) => {
    setMode(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  if (!mounted) return null

  return (
    <div
      role="group"
      aria-label="Thème de l'interface"
      className="tt-group"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 30,
        borderRadius: 100,
        border: '1px solid var(--border)',
        padding: '2px 3px',
        gap: 2,
      }}
    >
      <style>{`
        .tt-group { background: rgba(255,255,255,0.03); }
        [data-theme="light"] .tt-group { background: rgba(0,0,0,0.03); }
        .tt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 22px;
          border-radius: 100px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          line-height: 1;
          color: var(--dim);
          transition: background .2s, color .2s, box-shadow .2s;
          position: relative;
        }
        .tt-btn:hover { color: var(--text); }
        .tt-btn.active {
          background: oklch(0.68 0.24 280 / 0.18);
          color: var(--v);
          box-shadow: 0 0 0 1px oklch(0.68 0.24 280 / 0.35);
        }
        [data-theme="light"] .tt-btn.active {
          background: oklch(0.55 0.24 280 / 0.14);
          color: oklch(0.45 0.24 280);
          box-shadow: 0 0 0 1px oklch(0.55 0.24 280 / 0.3);
        }
      `}</style>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`tt-btn${mode === opt.value ? ' active' : ''}`}
          onClick={() => handleSelect(opt.value)}
          aria-label={opt.ariaLabel}
          aria-pressed={mode === opt.value}
          title={opt.ariaLabel}
        >
          <ThemeIcon mode={opt.value} />
        </button>
      ))}
    </div>
  )
}
