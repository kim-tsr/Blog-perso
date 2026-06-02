/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import type { ArticleTheme } from '@/lib/theme'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const THEME_COLORS: Record<ArticleTheme, { accent: string; glow: string; label: string }> = {
  violet: { accent: '#a78bfa', glow: 'rgba(167, 139, 250, 0.35)', label: 'INFRASTRUCTURE' },
  cyan:   { accent: '#67e8f9', glow: 'rgba(103, 232, 249, 0.35)', label: 'CYBERSÉCURITÉ' },
  amber:  { accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.35)',  label: 'RÉSEAU' },
}

interface OgProps {
  title: string
  subtitle?: string
  kind?: 'article' | 'lab' | 'home'
  theme?: ArticleTheme
  meta?: string
}

export function renderOgImage({ title, subtitle, kind = 'home', theme = 'violet', meta }: OgProps) {
  const colors = THEME_COLORS[theme]
  const kindLabel = kind === 'article' ? 'ARTICLE' : kind === 'lab' ? 'LAB' : 'BLOG'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#07070c',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          color: '#ede9ff',
          position: 'relative',
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -150,
            width: 600,
            height: 600,
            background: colors.glow,
            filter: 'blur(120px)',
            borderRadius: '50%',
          }}
        />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: colors.accent,
                boxShadow: `0 0 18px ${colors.accent}`,
              }}
            />
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>dev.sec.ops</div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 14,
              letterSpacing: '0.18em',
              color: colors.accent,
              fontFamily: 'monospace',
              border: `1px solid ${colors.accent}`,
              padding: '6px 14px',
              borderRadius: 999,
            }}
          >
            {kindLabel} · {colors.label}
          </div>
        </div>

        {/* Middle: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative', maxWidth: 1020 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              color: '#ffffff',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 26, color: '#a8a4c1', lineHeight: 1.4, fontWeight: 300, maxWidth: 980 }}>
              {subtitle.length > 180 ? subtitle.slice(0, 177) + '…' : subtitle}
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 16,
            color: '#6b6884',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 24,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 18 }}>{meta || '// par Kim Tessier'}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>→</span> dev-sec-ops.fr
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
