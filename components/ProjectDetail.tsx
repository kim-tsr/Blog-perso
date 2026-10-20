import Link from 'next/link'
import CodeBlock, { CODE_CSS } from './CodeBlock'
import KortToc from './KortToc'
import LightRays from './LightRays'
import type { Story } from '@/lib/kort'

export default function ProjectDetail({ story: k, overview }: { story: Story; overview: { label: string; node: React.ReactNode } }) {
  const toc = [
    { id: 'overview', label: overview.label },
    ...k.steps.map((s, i) => ({ id: `etape-${i}`, label: s.title })),
    { id: 'retex', label: 'RETEX' },
  ]
  return (
    <div className="kd">
      <style>{CODE_CSS + `
        .kd-hero { position:relative; padding:72px 0 56px; overflow:hidden; }
        .kd-hero .container { position:relative; z-index:1; }
        .kd-back { display:inline-flex; font-size:14px; font-weight:500; color:var(--mid); margin-bottom:26px; }
        .kd-back:hover { color:var(--ink); }
        .kd h1 { font-weight:700; font-size:clamp(40px,6.5vw,76px); line-height:1.04; letter-spacing:-.035em; margin:6px 0 22px; max-width:900px; }
        .kd-intro { color:var(--mid); font-size:18px; line-height:1.8; max-width:760px; }
        .kd-tags, .kd-links { list-style:none; display:flex; flex-wrap:wrap; gap:8px; margin-top:22px; }
        .kd-links a { font-size:14px; font-weight:600; border:1px solid var(--border); padding:8px 16px; border-radius:10px; display:inline-block; background:color-mix(in srgb, var(--bg) 70%, transparent); transition:border-color .15s; }
        .kd-links a:hover { border-color:var(--ink); }
        .kd-layout { display:grid; grid-template-columns:200px minmax(0,1fr); gap:56px; padding-bottom:110px; }
        @media (max-width:1000px) { .kd-layout { grid-template-columns:1fr; } }
        .kd h2 { font-size:clamp(26px,3vw,34px); font-weight:700; letter-spacing:-.025em; margin:0 0 20px; scroll-margin-top:100px; }
        .kd-sec { margin-bottom:72px; scroll-margin-top:100px; }
        .kd-panel { border:1px solid var(--border); border-radius:20px; background:color-mix(in srgb, var(--bg) 78%, transparent); padding:20px;
          background-image:radial-gradient(var(--border) 1px, transparent 1px); background-size:18px 18px; }
        .kd-note { color:var(--mid); font-size:16px; line-height:1.8; margin-top:20px; max-width:720px; }
        .kd-table-wrap { overflow-x:auto; margin-top:24px; border:1px solid var(--border); border-radius:14px; }
        .kd-table { width:100%; border-collapse:collapse; font-size:14px; }
        .kd-table th, .kd-table td { text-align:left; padding:11px 16px; border-bottom:1px solid var(--border); }
        .kd-table tr:last-child td { border-bottom:0; }
        .kd-table th { font-size:12px; font-weight:600; color:var(--dim); background:var(--bg2); text-transform:uppercase; letter-spacing:.05em; }
        .kd-table td:first-child { font-weight:600; font-family:var(--fm); font-size:13px; }
        .kd-step { display:grid; grid-template-columns:minmax(0,1fr); gap:22px; padding:44px 0; border-top:1px solid var(--border); scroll-margin-top:100px; }
        .kd-step:first-of-type { border-top:0; padding-top:0; }
        @media (min-width:1280px) { .kd-step.has-code { grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:36px; } .kd-step .kd-code { position:sticky; top:110px; align-self:start; } }
        .kd-step h3 { font-size:clamp(21px,2.2vw,26px); font-weight:700; letter-spacing:-.02em; line-height:1.25; margin-bottom:14px; }
        .kd-step p { color:var(--mid); font-size:16px; line-height:1.85; }
        .kd-step p + p { margin-top:14px; }
        .kd-code { min-width:0; display:flex; flex-direction:column; gap:16px; }
        .kd-code .cb { margin:0; }
        .kd-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:700px){ .kd-grid { grid-template-columns:1fr; } }
        .kd-box { border:1px solid var(--border); border-radius:20px; padding:26px; background:color-mix(in srgb, var(--bg) 78%, transparent); }
        .kd-box:first-child { background:radial-gradient(90% 70% at 0% 0%, var(--glow-a), transparent 70%), color-mix(in srgb, var(--bg) 78%, transparent); }
        .kd-box h3 { font-size:16px; font-weight:650; margin-bottom:14px; }
        .kd-box ul { padding-left:18px; color:var(--mid); line-height:1.75; font-size:15px; }
        .kd-box li { margin-bottom:10px; }
      `}</style>

      <header className="kd-hero">
        <LightRays height={520} />
        <div className="container">
          <Link href="/projets" className="kd-back">← Tous les projets</Link>
          <div className="stag">Retour d&apos;expérience</div>
          <h1>{k.title}</h1>
          <p className="kd-intro">{k.intro}</p>
          <ul className="kd-tags">{k.tech.map(t => <li key={t} className="tag">{t}</li>)}</ul>
          <ul className="kd-links">
            {k.repos.map(r => <li key={r.href}>{r.href.startsWith('/')
              ? <Link href={r.href}>{r.label} →</Link>
              : <a href={r.href} target="_blank" rel="noopener noreferrer">{r.label} ↗</a>}</li>)}
          </ul>
        </div>
      </header>

      <div className="container kd-layout">
        <KortToc items={toc} />
        <article>
          <section id="overview" className="kd-sec">
            <h2>{overview.label}</h2>
            {overview.node}
          </section>

          <div className="kd-sec" style={{ marginBottom: 56 }}>
            <h2>Comment je l&apos;ai fait</h2>
            {k.steps.map((s, i) => (
              <section key={s.title} id={`etape-${i}`} className={`kd-step${s.snippets ? ' has-code' : ''}`}>
                <div>
                  <h3>{s.title}</h3>
                  {s.text.map(t => <p key={t.slice(0, 24)}>{t}</p>)}
                </div>
                {s.snippets && <div className="kd-code">{s.snippets.map(sn => <CodeBlock key={sn.file} {...sn} />)}</div>}
              </section>
            ))}
          </div>

          <section id="retex" className="kd-sec">
            <h2>RETEX</h2>
            <div className="kd-grid">
              <div className="kd-box"><h3>Ce que j&apos;en retiens</h3><ul>{k.retex.learned.map(l => <li key={l}>{l}</li>)}</ul></div>
              <div className="kd-box"><h3>Ce que je ferais ensuite</h3><ul>{k.retex.next.map(l => <li key={l}>{l}</li>)}</ul></div>
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}
