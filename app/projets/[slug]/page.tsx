import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import {
  getAllProjects,
  getProjectBySlug,
  projectSlug,
  categoryToAccent,
  PROJECT_DETAILS,
  type ProjectStatus,
} from '@/lib/projects'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const ACCENT_VAR: Record<'v' | 'c' | 'a', string> = {
  v: 'var(--v)', c: 'var(--c)', a: 'var(--a)',
}

const STATUS_INFO: Record<ProjectStatus, { label: string; color: string; pulse: boolean }> = {
  live:    { label: 'En production', color: 'var(--c)', pulse: true },
  beta:    { label: 'Beta',          color: 'var(--v)', pulse: true },
  wip:     { label: 'En cours',      color: 'var(--a)', pulse: false },
  archive: { label: 'Archive',       color: 'var(--dim)', pulse: false },
}

export async function generateStaticParams() {
  const all = await getAllProjects()
  return all.map(p => ({ slug: projectSlug(p.title) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  const url = `${SITE_URL}/projets/${slug}`
  return {
    title: `${project.title} — Projet ${SITE_NAME}`,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description: project.description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const accent = ACCENT_VAR[categoryToAccent(project.category_slug)]
  const st = STATUS_INFO[project.status]
  const detail = PROJECT_DETAILS[slug]

  return (
    <>
      <style>{`
        .pd-hero { min-height: 38vh; display: flex; align-items: flex-end; padding: 140px 0 56px; position: relative; overflow: hidden; }
        .pd-orb { position: absolute; width: 560px; height: 560px; border-radius: 50%; filter: blur(110px); top: -200px; right: -120px; background: color-mix(in oklab, var(--pd-col) 22%, transparent); pointer-events: none; }
        .pd-back { display: inline-flex; align-items: center; gap: 7px; font-family: var(--fm); font-size: 11px; letter-spacing: .06em; color: var(--dim); transition: color .2s; margin-bottom: 28px; }
        .pd-back:hover { color: var(--text); }
        .pd-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
        .pd-status { display:inline-flex; align-items:center; gap:7px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--st-col); padding:4px 12px 4px 9px; border:1px solid color-mix(in oklab, var(--st-col) 35%, transparent); border-radius:100px; background:color-mix(in oklab, var(--st-col) 10%, transparent); }
        .pd-status-dot { width:6px; height:6px; border-radius:50%; background:var(--st-col); box-shadow:0 0 8px var(--st-col); }
        .pd-status-dot.pulse { animation: pdP 2s ease-in-out infinite; }
        @keyframes pdP { 0%,100%{opacity:1;} 50%{opacity:.45;} }
        .pd-year { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.1em; }
        .pd-title { font-family: var(--fd); font-size: clamp(34px, 6vw, 64px); font-weight: 700; letter-spacing: -.03em; line-height: 1.02; color: var(--text); }
        .pd-tagline { font-size: 17px; color: var(--mid); margin-top: 18px; max-width: 640px; line-height: 1.6; font-weight: 300; }

        .pd-body { max-width: 760px; }
        .pd-section-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--pd-col); margin-bottom:16px; }
        .pd-p { font-size: 15.5px; line-height: 1.85; color: var(--mid); margin-bottom: 18px; font-weight: 300; }
        .pd-p:last-child { margin-bottom: 0; }

        .pd-highlights { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
        .pd-hl { display: flex; align-items: flex-start; gap: 12px; font-size: 14.5px; color: var(--text); line-height: 1.5; }
        .pd-hl svg { color: var(--pd-col); flex-shrink: 0; margin-top: 3px; }

        .pd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .pd-tag { font-family: var(--fm); font-size: 11px; letter-spacing: .06em; color: var(--pd-col); background: color-mix(in oklab, var(--pd-col) 10%, transparent); border: 1px solid color-mix(in oklab, var(--pd-col) 22%, transparent); padding: 5px 13px; border-radius: 100px; }

        .pd-cta-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; }
        .pd-cta { display:inline-flex; align-items:center; gap:9px; font-size:14px; font-weight:600; padding:13px 22px; border-radius:100px; transition: transform .2s, box-shadow .3s, background .2s, border-color .2s; }
        .pd-cta-primary { background: var(--pd-col); color: var(--bg); }
        .pd-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 34px color-mix(in oklab, var(--pd-col) 40%, transparent); }
        .pd-cta-ghost { border:1px solid var(--border); color: var(--text); background: rgba(255,255,255,.03); }
        .pd-cta-ghost:hover { border-color: var(--pd-col); color: var(--pd-col); }
        html[data-theme="light"] .pd-cta-ghost { background: rgba(0,0,0,.03); }

        .pd-grid { display: grid; grid-template-columns: 1fr; gap: 56px; }

        .pd-block + .pd-block { padding-top: 4px; }
      `}</style>

      <section className="pd-hero" style={{ '--pd-col': accent } as React.CSSProperties}>
        <div className="pd-orb" style={{ '--pd-col': accent } as React.CSSProperties} aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/projets" className="pd-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Tous les projets
          </Link>
          <div className="pd-head" style={{ '--st-col': st.color } as React.CSSProperties}>
            <span className="pd-status">
              <span className={`pd-status-dot${st.pulse ? ' pulse' : ''}`} aria-hidden="true" />
              {st.label}
            </span>
            {project.year && <span className="pd-year">{project.year}</span>}
          </div>
          <h1 className="pd-title">{project.title}</h1>
          {detail?.tagline && <p className="pd-tagline">{detail.tagline}</p>}
        </div>
      </section>

      <div className="beam-sep" aria-hidden="true" />

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="pd-body" style={{ '--pd-col': accent } as React.CSSProperties}>
            <div className="pd-grid">
              <div className="pd-block">
                <div className="pd-section-label">À propos</div>
                {(detail?.overview ?? [project.description]).map((para, i) => (
                  <p key={i} className="pd-p">{para}</p>
                ))}
              </div>

              {detail?.highlights?.length ? (
                <div className="pd-block">
                  <div className="pd-section-label">Points clés</div>
                  <ul className="pd-highlights">
                    {detail.highlights.map(h => (
                      <li key={h} className="pd-hl">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.tags.length > 0 && (
                <div className="pd-block">
                  <div className="pd-section-label">Stack</div>
                  <div className="pd-tags">
                    {project.tags.map(t => <span key={t} className="pd-tag">{t}</span>)}
                  </div>
                </div>
              )}

              <div className="pd-block">
                <div className="pd-section-label">Liens</div>
                <div className="pd-cta-row">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="pd-cta pd-cta-ghost">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                      Voir le dépôt
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="pd-cta pd-cta-primary">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Ouvrir le site
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
