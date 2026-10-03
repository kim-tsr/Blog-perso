'use client'
import Link from 'next/link'
import type { Project } from '@/lib/projects'

const AREA: Record<string, string> = {
  kort: 'a-kort', 'pipeline-slsa': 'a-slsa', 'infra-multi-sites': 'a-infra', audits: 'a-audit',
  'classifieur-prompts': 'a-clf', 'recherche-offensive': 'a-off', 'detection-intrusion': 'a-ids',
  'clone-twitter': 'a-tw', pcbwalker: 'a-pcb',
}

function Cell({ p, i }: { p: Project; i: number }) {
  const big = p.id === 'kort' || p.id === 'pipeline-slsa'
  const shown = big ? p.tech : p.tech.slice(0, 4)
  const body = (
    <>
      <div className="bn-top">
        <span className="bn-num">{String(i + 1).padStart(2, '0')}</span>
        {p.slug && <span className="bn-open">Retour d&apos;expérience →</span>}
      </div>
      <h3 className="bn-title">{p.title}</h3>
      <p className="bn-desc">{p.description}</p>
      <ul className="bn-tags">
        {shown.map(t => <li key={t} className="tag">{t}</li>)}
        {shown.length < p.tech.length && <li className="tag">+{p.tech.length - shown.length}</li>}
      </ul>
    </>
  )
  const cls = `bn ${AREA[p.id] ?? ''}${big ? ' bn-big' : ''}${p.slug ? ' bn-link' : ''}`
  return p.slug
    ? <Link href={`/projets/${p.slug}`} id={p.id} className={cls}>{body}</Link>
    : <article id={p.id} className={cls}>{body}</article>
}

export default function ProjectsBento({ projects }: { projects: Project[] }) {
  const spot = (e: React.MouseEvent<HTMLElement>) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('.bn')
    if (!t) return
    const r = t.getBoundingClientRect()
    t.style.setProperty('--mx', `${e.clientX - r.left}px`)
    t.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div className="bento" onMouseMove={spot}>
      <style>{`
        .bento { display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:minmax(250px,auto); gap:16px; }
        .a-kort { grid-column:1 / span 2; grid-row:1; }
        .a-slsa { grid-column:3 / span 2; grid-row:1; }
        .a-infra { grid-column:1; } .a-audit { grid-column:2; }
        .a-clf { grid-column:3 / span 2; } .a-off, .a-ids, .a-tw, .a-pcb { grid-column:auto; }
        .bn { position:relative; display:flex; flex-direction:column; padding:24px; border:1px solid var(--border); border-radius:20px; overflow:hidden; scroll-margin-top:100px;
          background:color-mix(in srgb, var(--bg) 78%, transparent); transition:border-color .2s, transform .25s var(--ease), box-shadow .25s; }
        .bn::before { content:''; position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .25s;
          background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%), var(--glow-a), transparent 70%); }
        .bn:hover { border-color:color-mix(in srgb, var(--accent) 35%, var(--border)); box-shadow:0 10px 36px rgba(0,0,0,.07); }
        .bn:hover::before { opacity:1; }
        .bn-link:hover { transform:translateY(-3px); }
        .bn-big { padding:30px; background:radial-gradient(90% 60% at 0% 0%, var(--glow-a), transparent 70%), color-mix(in srgb, var(--bg) 78%, transparent); }
        .bn > * { position:relative; }
        .bn-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:13px; }
        .bn-num { color:var(--dim); font-weight:500; font-variant-numeric:tabular-nums; }
        .bn-open { color:var(--accent); font-weight:600; }
        .bn-title { font-size:18px; font-weight:650; letter-spacing:-.015em; line-height:1.3; margin-bottom:10px; }
        .bn-big .bn-title { font-size:clamp(22px,2.2vw,26px); letter-spacing:-.02em; }
        .bn-desc { font-size:14.5px; color:var(--mid); line-height:1.7; display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }
        .bn-big .bn-desc { -webkit-line-clamp:unset; display:block; font-size:15.5px; }
        .bn-tags { list-style:none; display:flex; flex-wrap:wrap; gap:6px; margin-top:auto; padding-top:18px; }
        @media (max-width:1000px) {
          .bento { grid-template-columns:repeat(2,1fr); }
          .bento > * { grid-column:auto !important; grid-row:auto !important; }
          .bento > .bn-big { grid-column:1 / -1 !important; }
        }
        @media (max-width:640px) { .bento { grid-template-columns:1fr; } }
      `}</style>
      {projects.map((p, i) => <Cell key={p.id} p={p} i={i} />)}
    </div>
  )
}
