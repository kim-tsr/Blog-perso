import type { Project } from '@/lib/projects'

const COL = { v: 'var(--v)', c: 'var(--c)', a: 'var(--a)' }

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const col = COL[project.accent]
  return (
    <article className="pj" style={{ ['--pj-col' as string]: col }}>
      <div className="pj-num">{String(index + 1).padStart(2, '0')}</div>
      <h3 className="pj-title">{project.title}</h3>
      <p className="pj-desc">{project.description}</p>
      <div className="pj-tags">
        {project.tech.map(t => <span key={t} className="pj-tag">{t}</span>)}
      </div>
      {project.href && (
        <a href={project.href} className="pj-link" target="_blank" rel="noopener noreferrer">Dépôt ↗</a>
      )}
    </article>
  )
}

export const PROJECT_CARD_CSS = `
  .pj-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:22px; }
  @media(max-width:800px){ .pj-grid { grid-template-columns:1fr; } }
  .pj { position:relative; display:flex; flex-direction:column; padding:30px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid var(--border); transition:border-color .3s, transform .4s var(--ease), box-shadow .3s; }
  .pj:hover { border-color:color-mix(in oklab, var(--pj-col) 50%, transparent); transform:translateY(-6px); box-shadow:0 24px 64px rgba(0,0,0,.35); }
  .pj-num { font-family:var(--fm); font-size:10px; letter-spacing:.15em; color:var(--pj-col); margin-bottom:14px; }
  .pj-title { font-family:var(--fd); font-size:21px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:12px; }
  .pj-desc { font-size:14px; color:var(--mid); line-height:1.7; font-weight:300; flex:1; }
  .pj-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:20px; }
  .pj-tag { font-family:var(--fm); font-size:10px; letter-spacing:.06em; color:var(--pj-col); background:color-mix(in oklab, var(--pj-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--pj-col) 22%, transparent); padding:3px 10px; border-radius:100px; }
  .pj-link { margin-top:18px; font-size:12px; font-weight:600; color:var(--pj-col); }
`
