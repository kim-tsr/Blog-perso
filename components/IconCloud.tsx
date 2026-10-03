'use client'
import { useEffect, useRef } from 'react'

export interface CloudIcon { title: string; path: string; hex: string; lum: number }

// Sphère 3D d'icônes (Icon Cloud) : répartition de Fibonacci, rotation douce, réagit à la souris.
export default function IconCloud({ icons }: { icons: CloudIcon[] }) {
  const box = useRef<HTMLDivElement>(null)
  const els = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const n = icons.length
    const pts = icons.map((_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
      const th = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
      return { x: Math.cos(th) * Math.sin(phi), y: Math.cos(phi), z: Math.sin(th) * Math.sin(phi) }
    })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ax = 0.0, ay = 0.0025, tx = 0, ty = 0.0025, raf = 0, visible = true

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      ax += (tx - ax) * 0.05; ay += (ty - ay) * 0.05
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay)
      const R = el.clientWidth * 0.39
      pts.forEach((p, i) => {
        const y1 = p.y * cx - p.z * sx, z1 = p.y * sx + p.z * cx
        const x2 = p.x * cy + z1 * sy, z2 = -p.x * sy + z1 * cy
        p.x = x2; p.y = y1; p.z = z2
        const node = els.current[i]
        if (!node) return
        const depth = (z2 + 1) / 2
        node.style.transform = `translate(${x2 * R}px, ${y1 * R}px) scale(${0.55 + depth * 0.6})`
        node.style.opacity = String(0.3 + depth * 0.7)
        node.style.zIndex = String(Math.round(depth * 100))
      })
    }
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5
      ty = nx * 0.035; tx = -ny * 0.035
    }
    const leave = () => { tx = 0; ty = 0.0025 }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    if (reduce) { ay = 0; ty = 0; tx = 0; frame(); cancelAnimationFrame(raf) }
    else {
      el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave)
      raf = requestAnimationFrame(frame)
    }
    return () => { cancelAnimationFrame(raf); io.disconnect(); el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [icons])

  return (
    <div className="ic" ref={box} role="img" aria-label={`Technologies utilisées : ${icons.map(i => i.title).join(', ')}`}>
      <style>{`
        .ic { position:relative; width:min(560px,100%); aspect-ratio:1; margin:0 auto; }
        .ic-n { position:absolute; left:50%; top:50%; width:56px; height:56px; margin:-28px 0 0 -28px; display:flex; align-items:center; justify-content:center; border-radius:16px;
          background:color-mix(in srgb, var(--bg) 82%, transparent); border:1px solid var(--border); backdrop-filter:blur(4px); will-change:transform,opacity; }
        .ic-n svg { width:28px; height:28px; fill:var(--c); }
        html[data-theme="dark"] .ic-n.dk svg { fill:#e6edf3; }
        html:not([data-theme="dark"]) .ic-n.lt svg { fill:#111827; }
        @media (max-width:520px) { .ic-n { width:44px; height:44px; margin:-22px 0 0 -22px; border-radius:12px; } .ic-n svg { width:22px; height:22px; } }
      `}</style>
      {icons.map((ic, i) => (
        <div key={ic.title} ref={n => { els.current[i] = n }} className={`ic-n${ic.lum < 0.22 ? ' dk' : ''}${ic.lum > 0.85 ? ' lt' : ''}`} title={ic.title} style={{ ['--c' as string]: `#${ic.hex}` }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ic.path} /></svg>
        </div>
      ))}
    </div>
  )
}
