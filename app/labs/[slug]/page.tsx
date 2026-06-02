import { getAllLabs, getLabBySlug } from '@/lib/labs'
import { getThemeClasses } from '@/lib/theme'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdxComponents'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'
import BookmarkButton from '@/components/BookmarkButton'
import Footer from '@/components/Footer'
import Paywall from '@/components/Paywall'
import LabSeriesBanner from '@/components/LabSeriesBanner'
import LabQuiz from '@/components/LabQuiz'
import { getCurrentProfile, hasRole } from '@/lib/auth'
import { toggleLabCompletionForm } from '@/lib/progress'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/lib/site'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const all = await getAllLabs()
  return all.map(l => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lab = await getLabBySlug(slug)
  if (!lab) return {}
  const url = `${SITE_URL}/labs/${lab.slug}`
  return {
    title: `${lab.title} — Lab ${SITE_NAME}`,
    description: lab.objective,
    alternates: { canonical: url },
    openGraph: {
      title: lab.title,
      description: lab.objective,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'fr_FR',
      authors: [SITE_AUTHOR],
      tags: [lab.tag, lab.difficulty],
    },
    twitter: {
      card: 'summary_large_image',
      title: lab.title,
      description: lab.objective,
    },
  }
}

const DIFF_DOTS: Record<string, number> = {
  'débutant': 1, 'intermédiaire': 2, 'avancé': 3,
}

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lab = await getLabBySlug(slug)
  if (!lab) notFound()

  const profile = await getCurrentProfile()
  const allowed = hasRole(profile?.role ?? null, lab.minRole)

  // Statut actuel de progression (si l'user est connecté)
  let labStatus: 'started' | 'completed' | null = null
  if (allowed && profile && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('lab_progress')
        .select('status')
        .eq('lab_slug', lab.slug)
        .maybeSingle()
      labStatus = (data?.status as 'started' | 'completed') ?? null
    } catch {}
  }

  const { tc } = getThemeClasses(lab.theme)
  const col = tc === 'tv' ? 'var(--v)' : tc === 'tc' ? 'var(--c)' : 'var(--a)'
  const dots = DIFF_DOTS[lab.difficulty] || 1
  const allLabs = await getAllLabs()
  const labsInSeries = lab.series ? allLabs.filter(l => l.series === lab.series) : []
  // En présence d'une série, "otherLabs" privilégie les autres labs de la série
  const otherLabs = lab.series
    ? allLabs.filter(l => l.slug !== lab.slug && l.series !== lab.series).slice(0, 3)
    : allLabs.filter(l => l.slug !== lab.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lab.title,
    description: lab.objective,
    learningResourceType: 'Lab',
    educationalLevel: lab.difficulty,
    timeRequired: lab.duration,
    teaches: lab.tools.join(', '),
    inLanguage: 'fr',
    keywords: [lab.tag, lab.difficulty, ...lab.tools],
    author: { '@type': 'Person', name: SITE_AUTHOR },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url: `${SITE_URL}/labs/${lab.slug}`,
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />
      <TableOfContents />
      <style>{`
        .lb-hero { padding:140px 0 50px; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
        .lb-crumb { display:inline-flex; align-items:center; gap:8px; font-family:var(--fm); font-size:11px; letter-spacing:.12em; color:var(--dim); text-transform:uppercase; margin-bottom:28px; padding:6px 14px; border-radius:100px; border:1px solid var(--border); background:rgba(255,255,255,.025); transition:color .2s, border-color .2s, background .2s; }
        .lb-crumb:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .lb-hero-orb { position:absolute; width:500px; height:400px; border-radius:50%; filter:blur(110px); top:-150px; right:-80px; pointer-events:none; opacity:.5; }
        .lb-hero-inner { max-width:860px; margin:0 auto; padding:0 48px; position:relative; z-index:1; }
        .lb-tag { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; padding:4px 12px; border-radius:100px; color:var(--lb-col); background:color-mix(in oklab, var(--lb-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--lb-col) 22%, transparent); display:inline-block; margin-bottom:24px; }
        .lb-title { font-family:var(--fd); font-size:clamp(32px,5vw,52px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:18px; }
        .lb-obj { font-size:17px; color:var(--mid); font-weight:300; line-height:1.7; max-width:680px; margin-bottom:28px; }

        .lb-meta-row { display:flex; gap:24px; font-family:var(--fm); font-size:11px; color:var(--dim); flex-wrap:wrap; margin-bottom:28px; }
        .lb-meta-row span { display:inline-flex; align-items:center; gap:7px; }
        .lb-meta-row svg { color:var(--dim); }
        .lb-diff-dots { display:inline-flex; gap:4px; }
        .lb-diff-dot { width:6px; height:6px; border-radius:50%; background:var(--lb-col); }
        .lb-diff-dot.dim { background:rgba(255,255,255,.15); }

        .lb-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-top:24px; }
        @media(max-width:768px) { .lb-info-grid { grid-template-columns:1fr; } }
        .lb-info-cell { background:var(--bg); padding:24px 26px; }
        .lb-info-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--lb-col); margin-bottom:14px; }
        .lb-info-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
        .lb-info-list li { font-size:13px; color:var(--mid); line-height:1.6; padding-left:18px; position:relative; }
        .lb-info-list li::before { content:''; position:absolute; left:0; top:8px; width:8px; height:1px; background:var(--lb-col); }
        .lb-info-tags { display:flex; flex-wrap:wrap; gap:6px; }
        .lb-info-tag { font-family:var(--fm); font-size:11px; letter-spacing:.06em; color:var(--lb-col); background:color-mix(in oklab, var(--lb-col) 8%, transparent); border:1px solid color-mix(in oklab, var(--lb-col) 18%, transparent); padding:4px 11px; border-radius:100px; }

        .lb-body { max-width:860px; margin:0 auto; padding:60px 48px 40px; }
        .lb-body.prose h2 { display:flex; align-items:center; gap:10px; }
        .lb-body.prose h2::before { content:''; }

        .lb-foot { max-width:860px; margin:0 auto; padding:0 48px 80px; }
        .lb-foot-cta { padding:36px 32px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap; margin-bottom:60px; }
        .lb-foot-cta-text { font-family:var(--fd); font-size:18px; font-weight:600; color:var(--text); letter-spacing:-.01em; }
        .lb-foot-cta-sub { font-size:14px; color:var(--mid); margin-top:4px; }

        .lb-others-title { font-family:var(--fd); font-size:18px; font-weight:600; color:var(--text); margin-bottom:18px; letter-spacing:-.01em; }
        .lb-others { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:768px) { .lb-others { grid-template-columns:1fr; } }
        .lb-other { padding:18px 20px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.02); transition:border-color .3s, transform .3s var(--ease), background .3s; display:flex; flex-direction:column; gap:6px; }
        .lb-other:hover { border-color:rgba(255,255,255,.14); transform:translateY(-2px); background:rgba(255,255,255,.04); }
        .lb-other-tag { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .lb-other-title { font-family:var(--fd); font-size:14px; font-weight:600; color:var(--text); line-height:1.4; }
        .lb-other-meta { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:4px; }

        @media(max-width:768px) { .lb-hero-inner, .lb-body, .lb-foot { padding-left:24px; padding-right:24px; } }
      `}</style>

      <div className="lb-hero" style={{ '--lb-col': col } as React.CSSProperties}>
        <div className="lb-hero-orb" aria-hidden="true" style={{
          background: lab.theme === 'violet' ? 'oklch(0.50 0.28 280/.20)'
                    : lab.theme === 'cyan'   ? 'oklch(0.50 0.18 194/.18)'
                    : 'oklch(0.54 0.18 65/.18)',
        }} />
        <div className="lb-hero-inner">
          <Link href="/labs" className="lb-crumb">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 3L4 6l3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tous les labs
          </Link>
          <span className="lb-tag">Lab · {lab.tag}</span>
          <h1 className="lb-title">{lab.title}</h1>
          <p className="lb-obj">{lab.objective}</p>

          <div className="lb-meta-row">
            <span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1"/><path d="M6.5 4V6.5L8 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
              {lab.duration}
            </span>
            <span aria-label={`Difficulté : ${lab.difficulty}`}>
              <span className="lb-diff-dots">
                {[1,2,3].map(n => (
                  <span key={n} className={`lb-diff-dot${n > dots ? ' dim' : ''}`} aria-hidden="true" />
                ))}
              </span>
              {lab.difficulty}
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1.5 4l5 3 5-3M1.5 4v5.5a1 1 0 001 1h8a1 1 0 001-1V4M1.5 4l5-2.5L11.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {lab.tag}
            </span>
          </div>

          <div style={{ marginTop: 20 }}>
            <BookmarkButton type="lab" slug={lab.slug} />
          </div>

          <div className="lb-info-grid">
            <div className="lb-info-cell">
              <div className="lb-info-label">// Prérequis</div>
              <ul className="lb-info-list">
                {lab.prerequisites.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div className="lb-info-cell">
              <div className="lb-info-label">// Outils</div>
              <div className="lb-info-tags">
                {lab.tools.map(t => (
                  <span key={t} className="lb-info-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lab.series && labsInSeries.length > 1 && (
        <div style={{ paddingTop: 28 }}>
          <LabSeriesBanner current={lab} allInSeries={labsInSeries} />
        </div>
      )}

      {allowed ? (
        <>
          <div className="lb-body prose" style={{ '--lb-col': col } as React.CSSProperties}>
            <MDXRemote source={lab.content} components={mdxComponents} />
          </div>
          {profile && lab.quiz && lab.quiz.length > 0 && (
            <LabQuiz
              slug={lab.slug}
              questions={lab.quiz}
              alreadyCompleted={labStatus === 'completed'}
              onComplete={toggleLabCompletionForm}
              themeColor={col}
            />
          )}
        </>
      ) : (
        <Paywall
          required={lab.minRole}
          currentRole={profile?.role ?? null}
          kind="lab"
          title={lab.title}
          signinNext={`/labs/${lab.slug}`}
        />
      )}

      <div className="lb-foot">
        {allowed && profile && (!lab.quiz || lab.quiz.length === 0) && (
          <form action={toggleLabCompletionForm} className="lb-foot-cta" style={{ '--lb-col': col } as React.CSSProperties}>
            <input type="hidden" name="slug" value={lab.slug} />
            <div>
              <div className="lb-foot-cta-text">
                {labStatus === 'completed' ? '🎉 Lab terminé' : 'Tu as fini ce lab ?'}
              </div>
              <div className="lb-foot-cta-sub">
                {labStatus === 'completed'
                  ? 'Bravo. Il apparaît dans ton parcours.'
                  : 'Marque-le comme terminé pour le retrouver dans ton profil.'}
              </div>
            </div>
            <button type="submit" className={labStatus === 'completed' ? 'btn-g' : 'btn-p'} style={{ fontSize:13 }}>
              {labStatus === 'completed' ? 'Réouvrir' : 'Marquer comme terminé'}
              {labStatus !== 'completed' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.5L4.5 9l5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </form>
        )}

        <div className="lb-foot-cta">
          <div>
            <div className="lb-foot-cta-text">Bloqué ou une question ?</div>
            <div className="lb-foot-cta-sub">Toute remontée d&apos;erreur ou suggestion d&apos;amélioration est la bienvenue.</div>
          </div>
          <a href="mailto:kim.tessier07@gmail.com" className="btn-g" style={{ fontSize:13 }}>
            Me contacter
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        {otherLabs.length > 0 && (
          <>
            <div className="lb-others-title">D&apos;autres labs</div>
            <div className="lb-others">
              {otherLabs.map(o => {
                const { tc: oTc } = getThemeClasses(o.theme)
                return (
                  <Link key={o.slug} href={`/labs/${o.slug}`} className="lb-other">
                    <span className={`lb-other-tag ${oTc}`}>{o.tag}</span>
                    <div className="lb-other-title">{o.title}</div>
                    <div className="lb-other-meta">{o.duration} · {o.difficulty}</div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
