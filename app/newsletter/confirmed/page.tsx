import { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Newsletter confirmée — dev.sec.ops',
  robots: { index: false },
}

const ERRORS: Record<string, string> = {
  missing_token:   'Le lien de confirmation est invalide.',
  no_db:           'Le service est temporairement indisponible.',
  invalid_token:   'Le lien de confirmation a expiré.',
  token_not_found: 'Ce lien n\'est pas reconnu — peut-être déjà utilisé.',
  unknown:         'Une erreur inconnue est survenue.',
}

export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const errMsg = error ? (ERRORS[error] ?? ERRORS.unknown) : null

  return (
    <>
      <main style={{ minHeight:'calc(100vh - 200px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px 60px' }}>
        <div style={{ maxWidth:500, textAlign:'center' }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:11, letterSpacing:'.22em', color: errMsg ? 'oklch(0.78 0.16 25)' : 'var(--c)', textTransform:'uppercase', marginBottom:18 }}>
            // newsletter
          </div>
          <h1 style={{ fontFamily:'var(--fd)', fontSize:36, fontWeight:700, letterSpacing:'-.03em', color:'var(--text)', marginBottom:16 }}>
            {errMsg ? 'Confirmation impossible' : 'Inscription confirmée 🎉'}
          </h1>
          <p style={{ fontSize:15, color:'var(--mid)', lineHeight:1.7, fontWeight:300, marginBottom:30 }}>
            {errMsg ?? 'Tu recevras un email quand un nouveau lab ou un projet majeur est publié. Pas de spam, désabonnement en un clic.'}
          </p>
          <Link href="/labs" className="btn-p" style={{ fontSize:13 }}>
            Explorer les labs
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
