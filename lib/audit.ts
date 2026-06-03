import { createClient } from '@/lib/supabase/server'

/**
 * Journalise une action admin dans audit_logs.
 * Doit être appelé dans le contexte d'une server action déjà authentifiée admin.
 * Silencieux en cas d'échec — l'audit ne doit jamais bloquer l'action métier.
 */
export async function logAdminAction(
  action: string,
  target_type?: string | null,
  target_id?: string | null,
  payload?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    await supabase.rpc('log_admin_action', {
      p_action:      action,
      p_target_type: target_type ?? null,
      p_target_id:   target_id   ?? null,
      p_payload:     payload     ?? {},
    })
  } catch {}
}
