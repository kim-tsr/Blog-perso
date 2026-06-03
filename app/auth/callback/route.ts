import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Détecte le tout premier sign-in : si le profile vient d'être créé (< 30s)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const created = new Date(user.created_at).getTime()
          if (Date.now() - created < 30_000) {
            await trackServerEvent('signup', 'page', '/auth/signin')
          }
        }
      } catch {}
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent('Code OAuth manquant')}`)
}
