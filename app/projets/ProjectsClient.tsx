'use client'
import { useRef } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import type { Project } from './page'

const ACCENT = {
  v: { col: 'var(--v)', border: 'oklch(0.68 0.24 280/.45)', glow: 'radial-gradient(circle at 40% 0%,oklch(0.50 0.28 280/.2),transparent 70%)', tag: 'tv' },
  c: { col: 'var(--c)', border: 'oklch(0.75 0.16 194/.45)', glow: 'radial-gradient(circle at 40% 0%,oklch(0.50 0.18 194/.18),transparent 70%)', tag: 'tc' },
  a: { col: 'var(--a)', border: 'oklch(0.76 0.16 65/.45)',  glow: 'radial-gradient(circle at 40% 0%,oklch(0.54 0.18 65/.18),transparent 70%)',  tag: 'ta' },
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const cards = useRef<(HTMLDivElement | null)[]>([])

  const onMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const card = cards.current[i]; if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg) translateY(-8px)`
    card.style.transition = 'none'
  }
  const onLeave = (i: number) => {
    const card = cards.current[i]; if (!card) return
    card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)'
    card.style.transition = 'transform .5s var(--ease)'
  }

  return (
    <>
      <style>{`
        .proj-hero { min-height: 42vh; display: flex; align-items: flex-end; padding-bottom: 80px; padding-top: 140px; position: relative; overflow: hidden; }
        .proj-orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .proj-orb-1 { width: 600px; height: 600px; background: oklch(0.48 0.28 280 / 0.12); top: -200px; right: -100px; }
        .proj-orb-2 { width: 400px; height: 400px; background: oklch(0.50 0.18 194 / 0.10); bottom: -100px; left: -80px; }
        .proj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 60px; }
        @media (max-width: 900px) { .proj-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .proj-grid { grid-template-columns: 1fr; } }
        .pj { position: relative; padding: 36px 32px; border-radius: 14px; background: rgba(255,255,255,.03); border: 1px solid var(--border); overflow: hidden; transition: border-color .4s, transform .5s var(--ease), box-shadow .4s; transform-style: preserve-3d; will-change: transform; display: flex; flex-direction: column; gap: 0; }
        .pj::before { content: ''; position: absolute; inset: 0; background: var(--pj-glow, transparent); opacity: 0; transition: opacity .4s; border-radius: inherit; }
        .pj::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--pj-col), transparent); opacity: 0; transition: opacity .4s; }
        .pj:hover { border-color: var(--pj-border); box-shadow: 0 24px 64px rgba(0,0,0,.5); }
        .pj:hover::before, .pj:hover::after { opacity: 1; }
        .pj-shine { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.05) 50%, transparent 60%); transform: translateX(-100%); transition: transform .6s var(--ease); pointer-events: none; border-radius: inherit; }
        .pj:hover .pj-shine { transform: translateX(100%); }
        .pj-title { font-family: var(--fd); font-size: 20px; font-weight: 700; letter-spacing: -.02em; color: var(--text); margin-bottom: 12px; }
        .pj-desc { font-size: 14px; color: var(--mid); line-height: 1.75; font-weight: 300; flex: 1; }
        .pj-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 20px; }
        .pj-tag { font-family: var(--fm); font-size: 10px; letter-spacing: .08em; color: var(--pj-col); background: oklch(from var(--pj-col) l c h / 0.1); border: 1px solid oklch(from var(--pj-col) l c h / 0.2); padding: 3px 10px; border-radius: 100px; }
        .pj-links { display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
        .pj-link { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--pj-col); transition: opacity .2s; }
        .pj-link:hover { opacity: .7; }
        .pj-link-ghost { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--dim); transition: color .2s; }
        .pj-link-ghost:hover { color: var(--text); }
      `}</style>

      <section className="proj-hero">
        <div className="proj-orb proj-orb-1" aria-hidden="true" />
        <div className="proj-orb proj-orb-2" aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal><div className="stag">Portfolio</div></ScrollReveal>
          <ScrollReveal clip>
            <h1 className="stitle clip-inner" style={{ marginBottom: 0 }}>
              Mes <span className="g">Projets</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="ssub" style={{ marginTop: 16 }}>
              Projets personnels et open-source autour de l&apos;infrastructure, la sécurité et le réseau.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="beam-sep" aria-hidden="true" />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="proj-grid">
            {projects.map((p, i) => {
              const a = ACCENT[p.accent]
              return (
                <ScrollReveal key={p.title} delay={(i % 3) * 0.1}>
                  <div
                    className="pj"
                    ref={el => { cards.current[i] = el }}
                    onMouseMove={e => onMove(e, i)}
                    onMouseLeave={() => onLeave(i)}
                    style={{
                      '--pj-col': a.col,
                      '--pj-border': a.border,
                      '--pj-glow': a.glow,
                    } as React.CSSProperties}
                  >
                    <div className="pj-shine" aria-hidden="true" />
                    <h3 className="pj-title">{p.title}</h3>
                    <p className="pj-desc">{p.desc}</p>
                    <div className="pj-tags">
                      {p.tags.map(t => (
                        <span key={t} className="pj-tag">{t}</span>
                      ))}
                    </div>
                    <div className="pj-links">
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer" className="pj-link">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                          GitHub
                        </a>
                      )}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer" className="pj-link-ghost">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Voir le projet
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
