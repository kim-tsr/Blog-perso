import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_EVENTS = new Set([
  'page_view', 'lab_started', 'lab_completed', 'quiz_attempted',
  'signup', 'upgrade_to_pro', 'bookmark_added',
])

interface TrackPayload {
  event:        string
  content_type?: string | null
  content_slug?: string | null
  anon_id?:     string | null
  payload?:     Record<string, unknown>
}

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: false }, { status: 204 })
  }

  let body: TrackPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
  }

  if (!body.event || !ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 })
  }

  // Le client envoie un anon_id en plain text (UUID v4 stocké en localStorage).
  // On le tronque pour limiter d'éventuels abus.
  const anon = (body.anon_id ?? null)?.slice(0, 64) ?? null

  try {
    const supabase = await createClient()
    await supabase.rpc('track_event', {
      p_event:        body.event,
      p_content_type: body.content_type ?? null,
      p_content_slug: body.content_slug ?? null,
      p_anon_id:      anon,
      p_payload:      body.payload ?? {},
    })
  } catch {
    // silencieux — l'analytics ne doit jamais casser la nav
  }

  // 204 = pas de body — convient à sendBeacon
  return new NextResponse(null, { status: 204 })
}
