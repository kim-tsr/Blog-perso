'use client'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'system' | 'dark'

const OPTIONS: { value: ThemeMode; label: string; icon: string; ariaLabel: string }[] = [
  { value: 'light',  label: '☀',  icon: '☀',  ariaLabel: 'Mode clair' },
  { value: 'system', label: '🖥', icon: '🖥', ariaLabel: 'Mode système' },
  { value: 'dark',   label: '🌙', icon: '🌙', ariaLabel: 'Mode sombre' },
]

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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 30,
        borderRadius: 100,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.03)',
        padding: '2px 3px',
        gap: 2,
      }}
    >
      <style>{`
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
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
