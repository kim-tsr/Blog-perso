'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { TIMELINE, type TimelineLink } from '@/lib/timeline'

function Anchor({ l }: { l: TimelineLink }) {
  return l.external
    ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="tl-link">{l.label} ↗</a>
    : <Link href={l.href} className="tl-link">{l.label} →</Link>
}

export default function Timeline() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<SVGPathElement>(null)
  const [d, setD] = useState('')
  const [len, setLen] = useState(0)
  const [holes, setHoles] = useState<{ x: number; y: number; w: number; h: number }[]>([])
  const marks = useRef<{ y: number; L: number }[]>([])
  let n = 0

  // 1. trace la courbe à partir de la position réelle des points dans le DOM
  useEffect(() => {
    const el = root.current
    if (!el) return
    const build = () => {
      const cr = el.getBoundingClientRect()
      const pts = [...el.querySelectorAll<HTMLElement>('[data-dot]')].map(p => {
        const r = p.getBoundingClientRect()
        return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top }
      })
      if (!pts.length) return
      let path = `M ${pts[0].x} ${pts[0].y}`
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const ms = [{ y: pts[0].y, L: 0 }]
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], m = (a.y + b.y) / 2
        path += ` C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`
        probe.setAttribute('d', path)
        ms.push({ y: b.y, L: probe.getTotalLength() })
      }
      marks.current = ms
      setHoles([...el.querySelectorAll<HTMLElement>('.tl-phase h2, .tl-phase p')].map(h => {
        const r = h.getBoundingClientRect()
        return { x: r.left - cr.left - 6, y: r.top - cr.top - 2, w: r.width + 12, h: r.height + 4 }
      }))
      setD(path)
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { if (track.current) setLen(track.current.getTotalLength()) }, [d])

  // 2. tracé qui se remplit + étape active, au scroll
  useEffect(() => {
    const el = root.current
    if (!el) return
    el.classList.add('ready')
    let raf = 0
    const update = () => {
      raf = 0
      const cr = el.getBoundingClientRect()
      const mid = window.innerHeight * 0.55
      // longueur de courbe correspondant à la hauteur du milieu d'écran, interpolée entre les points
      const y = mid - cr.top, ms = marks.current
      let f = 0
      if (ms.length) {
        if (y >= ms[ms.length - 1].y) f = ms[ms.length - 1].L
        else if (y > ms[0].y) {
          const i = ms.findIndex(m => m.y >= y)
          const a = ms[i - 1], b = ms[i]
          f = a.L + ((y - a.y) / (b.y - a.y)) * (b.L - a.L)
        }
      }
      el.style.setProperty('--f', String(f))
      let best: HTMLElement | null = null, bestD = Infinity
      el.querySelectorAll<HTMLElement>('[data-step]').forEach(s => {
        const r = s.getBoundingClientRect()
        const dist = Math.abs(r.top + Math.min(r.height, 160) / 2 - mid)
        if (dist < bestD) { bestD = dist; best = s }
        s.classList.toggle('past', r.top < mid)
      })
      el.querySelectorAll('[data-step]').forEach(s => s.classList.toggle('active', s === best))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // 3. apparition décalée
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.15 })
    el.querySelectorAll('.tl-body, .tl-phase').forEach(b => io.observe(b))
    return () => io.disconnect()
  }, [])

  return (
    <section id="parcours" className="section" style={{ paddingTop: 20 }}>
      <style>{`
        .tl { position:relative; max-width:1040px; margin:0 auto; --f:0; }
        .tl-svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
        .tl-base { fill:none; stroke:var(--border); stroke-width:2; }
        .tl-fill { fill:none; stroke:var(--accent); stroke-width:3; stroke-linecap:round; }

        .tl-phase { position:relative; z-index:1; text-align:center; margin:96px 0 56px; }
        .tl-phase:first-of-type { margin-top:24px; }
        .tl-pdot { position:absolute; left:50%; top:50%; width:2px; height:2px; }
        .tl-phase h2 { display:inline-block; padding:10px 28px; font-size:clamp(30px,4.6vw,52px); font-weight:700; letter-spacing:-.03em; line-height:1.1; }
        .tl-phase p { font-size:16px; color:var(--dim); margin-top:6px; display:inline-block; padding:0 16px; }
        .tl-phase { opacity:0; transform:translateY(18px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
        .tl:not(.ready) .tl-phase { opacity:1; transform:none; }
        .tl-phase.in { opacity:1; transform:none; }

        .tl-step { position:relative; z-index:1; margin-bottom:72px; min-height:70px; transition:opacity .5s; }
        .tl.ready .tl-step:not(.active) { opacity:.5; }
        .tl-dot { position:absolute; top:14px; width:16px; height:16px; margin-left:-8px; border-radius:50%; background:var(--bg); border:3px solid var(--border); transition:transform .3s var(--ease), background .3s, border-color .3s; }
        .tl-step.past .tl-dot { border-color:var(--accent); }
        .tl-step.active .tl-dot { transform:scale(1.5); background:var(--accent); border-color:var(--accent); }
        .tl-step.l .tl-dot { left:40%; } .tl-step.r .tl-dot { left:60%; }

        .tl-body { --dx:-28px; width:calc(40% - 40px); text-align:right; }
        .tl-step.r .tl-body { --dx:28px; margin-left:calc(60% + 40px); width:calc(40% - 40px); text-align:left; }
        .tl.ready .tl-body { opacity:0; transform:translateX(var(--dx)); transition:opacity .8s var(--ease), transform .8s var(--ease); }
        .tl.ready .tl-body.in { opacity:1; transform:none; }

        .tl-body h3 { font-size:clamp(20px,2.3vw,26px); font-weight:700; letter-spacing:-.02em; line-height:1.2; margin-bottom:10px; }
        .tl-body p { font-size:16px; color:var(--mid); line-height:1.75; }
        .tl-tags { list-style:none; display:flex; flex-wrap:wrap; gap:4px 14px; margin-top:12px; font-size:13px; color:var(--dim); }
        .tl-step.l .tl-tags, .tl-step.l .tl-links { justify-content:flex-end; }
        .tl-video { position:relative; aspect-ratio:16/9; margin-top:18px; border-radius:10px; overflow:hidden; background:var(--bg2); box-shadow:0 10px 30px rgba(0,0,0,.12); }
        .tl-video iframe { position:absolute; inset:0; width:100%; height:100%; border:0; }
        .tl-links { display:flex; flex-wrap:wrap; gap:6px 18px; margin-top:14px; }
        .tl-link { font-size:14px; font-weight:600; color:var(--accent); }
        .tl-link:hover { text-decoration:underline; }

        @media (max-width:800px) {
          .tl-phase { text-align:left; padding-left:44px; margin:64px 0 36px; }
          .tl-pdot { left:14px; top:26px; }
          .tl-phase h2, .tl-phase p { padding-left:0; }
          .tl-step { margin-bottom:52px; }
          .tl-step.l .tl-dot, .tl-step.r .tl-dot { left:14px; }
          .tl-body, .tl-step.r .tl-body { --dx:24px; width:auto; margin-left:44px; text-align:left; }
          .tl-step.l .tl-tags, .tl-step.l .tl-links { justify-content:flex-start; }
        }
      `}</style>
      <div className="container">
        <div className="tl" ref={root}>
          <svg className="tl-svg" aria-hidden="true">
            <defs>
              <mask id="tl-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="3000" height="20000">
                <rect x="-100" y="-100" width="3000" height="20000" fill="white" />
                {holes.map((h, i) => <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx="8" fill="black" />)}
              </mask>
            </defs>
            <g mask="url(#tl-mask)">
            <path className="tl-base" d={d} />
            <path
              ref={track}
              className="tl-fill"
              d={d}
              style={len ? { strokeDasharray: len, strokeDashoffset: `calc(${len}px - var(--f) * 1px)` } : { opacity: 0 }}
            />
            </g>
          </svg>
          {TIMELINE.map(ph => (
            <div key={ph.phase}>
              <div className="tl-phase">
                <span className="tl-pdot" data-dot />
                <h2>{ph.phase}</h2>
                <br />
                <p>{ph.subtitle}</p>
              </div>
              {ph.items.map(it => {
                const side = n++ % 2 === 0 ? 'l' : 'r'
                return (
                  <div key={it.title} className={`tl-step ${side}`} data-step>
                    <span className="tl-dot" data-dot />
                    <div className="tl-body">
                      <h3>{it.title}</h3>
                      <p>{it.text}</p>
                      {it.youtube && (
                        <div className="tl-video">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${it.youtube}`}
                            title={it.title}
                            loading="lazy"
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {it.tags && <ul className="tl-tags">{it.tags.map(t => <li key={t}>{t}</li>)}</ul>}
                      {it.links && <div className="tl-links">{it.links.map(l => <Anchor key={l.href} l={l} />)}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
