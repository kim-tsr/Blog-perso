import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsv(s: string | null): string {
  if (s == null) return ''
  const needs = /[",\n]/.test(s)
  if (!needs) return s
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return new NextResponse('no_db', { status: 503 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('forbidden', { status: 403 })
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return new NextResponse('forbidden', { status: 403 })

  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('email, confirmed_at, unsubscribed_at, source_page, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as Array<{
    email: string; confirmed_at: string | null; unsubscribed_at: string | null;
    source_page: string | null; created_at: string;
  }>

  const csv = [
    'email,state,source,created_at,confirmed_at',
    ...rows.map(r => {
      const state = r.unsubscribed_at ? 'unsubscribed' : (r.confirmed_at ? 'confirmed' : 'pending')
      return [
        escapeCsv(r.email),
        state,
        escapeCsv(r.source_page),
        r.created_at,
        r.confirmed_at ?? '',
      ].join(',')
    }),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
    },
  })
}
