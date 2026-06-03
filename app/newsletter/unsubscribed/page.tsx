import { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Désabonnement — dev.sec.ops',
  robots: { index: false },
}

const ERRORS: Record<string, string> = {
  missing_token:   'Lien de désabonnement invalide.',
  no_db:           'Service temporairement indisponible.',
  token_not_found: 'Ce lien n\'est pas reconnu.',
  unknown:         'Une erreur inconnue est survenue.',
}

export default async function UnsubscribedPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const errMsg = error ? (ERRORS[error] ?? ERRORS.unknown) : null

  return (
    <>
      <main style={{ minHeight:'calc(100vh - 200px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px 60px' }}>
        <div style={{ maxWidth:500, textAlign:'center' }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:11, letterSpacing:'.22em', color:'var(--dim)', textTransform:'uppercase', marginBottom:18 }}>
            // newsletter
          </div>
          <h1 style={{ fontFamily:'var(--fd)', fontSize:36, fontWeight:700, letterSpacing:'-.03em', color:'var(--text)', marginBottom:16 }}>
            {errMsg ? 'Action impossible' : 'Désabonnement confirmé'}
          </h1>
          <p style={{ fontSize:15, color:'var(--mid)', lineHeight:1.7, fontWeight:300, marginBottom:30 }}>
            {errMsg ?? 'Tu ne recevras plus aucun email de notre part. Bon vent et bonne route.'}
          </p>
          <Link href="/" style={{ fontFamily:'var(--fm)', fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mid)' }}>← Retour à l&apos;accueil</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
