import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export function renderOgImage({ title, subtitle }: { title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#07070c', padding: '64px 72px', fontFamily: 'sans-serif', color: '#ede9ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 700 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#a78bfa' }} />
          kim.tsr
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-0.035em', color: '#ffffff' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 28, color: '#a8a4c1', fontWeight: 300 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', fontSize: 16, color: '#6b6884', fontFamily: 'monospace', letterSpacing: '0.1em' }}>kim-tsr.vercel.app</div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
