import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=missing_token`)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=no_db`)
  }

  const supabase = await createClient()
  const { data } = await supabase.rpc('newsletter_confirm', { p_token: token })
  const result = (data ?? {}) as { ok: boolean; error?: string }

  if (!result.ok) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?error=${result.error ?? 'unknown'}`)
  }

  return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed`)
}
