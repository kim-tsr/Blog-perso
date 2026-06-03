import { createClient } from '@/lib/supabase/server'

export type AnalyticsEvent =
  | 'page_view'
  | 'lab_started'
  | 'lab_completed'
  | 'quiz_attempted'
  | 'signup'
  | 'upgrade_to_pro'
  | 'bookmark_added'

/**
 * Trace un évènement côté serveur (server actions, route handlers).
 * Silencieux en cas d'erreur — l'analytics ne doit jamais casser l'action métier.
 *
 * Pour les page_view, préférer le composant client `<TrackView />` qui n'émet
 * qu'au montage côté navigateur (évite de compter les bots et les SSR).
 */
export async function trackServerEvent(
  event: AnalyticsEvent,
  content_type?: string | null,
  content_slug?: string | null,
  payload?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    await supabase.rpc('track_event', {
      p_event:        event,
      p_content_type: content_type ?? null,
      p_content_slug: content_slug ?? null,
      p_anon_id:      null,
      p_payload:      payload ?? {},
    })
  } catch {}
}
