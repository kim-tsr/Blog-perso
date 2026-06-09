'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { getLabBySlug } from '@/lib/labs'
import {
  createLabPod,
  deleteLabResources,
  getPodPhase,
  isK8sConfigured,
} from '@/lib/k8s'
import { logAdminAction } from '@/lib/audit'

export interface ActiveSession {
  id: string
  labSlug: string
  podName: string | null
  expiresAt: string
  sandboxUrl: string | null
}

const DEFAULT_TTL_SECONDS = 1800

function sandboxUrlFromSession(sessionId: string): string | null {
  const host = process.env.K8S_SANDBOX_HOST
  if (!host) return null
  return `https://${sessionId.slice(0, 8)}.${host}`
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('get_active_session')
    const payload = data as { ok: boolean; session: {
      id: string
      lab_slug: string
      pod_name: string | null
      expires_at: string
      status: string
    } | null } | null

    if (!payload?.ok || !payload.session) return null
    const s = payload.session
    return {
      id: s.id,
      labSlug: s.lab_slug,
      podName: s.pod_name,
      expiresAt: s.expires_at,
      sandboxUrl: sandboxUrlFromSession(s.id),
    }
  } catch {
    return null
  }
}

export async function startSession(
  slug: string,
): Promise<{ ok: true; sessionId: string; sandboxUrl: string; expiresAt: string } | { ok: false; error: string }> {
  const profile = await getCurrentProfile()
  if (!profile) return { ok: false, error: 'not_authenticated' }
  if (profile.role !== 'admin') return { ok: false, error: 'forbidden' }

  const lab = await getLabBySlug(slug)
  if (!lab) return { ok: false, error: 'lab_not_found' }
  if (!lab.sandboxable) return { ok: false, error: 'lab_not_sandboxable' }

  if (!isK8sConfigured()) return { ok: false, error: 'k8s_not_configured' }

  // Préallocation : on ouvre la ligne DB en 'pending' avec un pod name provisoire,
  // puis on crée le pod, puis on update — évite les pods orphelins si la DB échoue.
  const supabase = await createClient()
  const provisionalPodName = `lab-${slug.slice(0, 16)}-${Date.now().toString(36)}`

  const { data: rpc, error: rpcErr } = await supabase.rpc('start_lab_session', {
    p_slug: slug,
    p_pod_name: provisionalPodName,
    p_ttl_seconds: DEFAULT_TTL_SECONDS,
  })

  if (rpcErr) return { ok: false, error: rpcErr.message }
  const result = rpc as { ok: boolean; error?: string; session_id?: string; expires_at?: string }
  if (!result.ok || !result.session_id) return { ok: false, error: result.error ?? 'rpc_failed' }

  const sessionId = result.session_id

  let pod
  try {
    pod = await createLabPod({
      slug,
      sessionId,
      userId: profile.id,
      ttlSeconds: DEFAULT_TTL_SECONDS,
    })
  } catch (e) {
    // Rollback : ferme la session en DB pour éviter un slot bloqué
    await supabase.rpc('end_lab_session', { p_id: sessionId, p_reason: 'crashed' })
    const msg = e instanceof Error ? e.message : 'pod_creation_failed'
    return { ok: false, error: msg }
  }

  // Update pod_name réel (admin policy autorise l'UPDATE)
  await supabase
    .from('lab_sessions')
    .update({ k8s_pod_name: pod.podName })
    .eq('id', sessionId)

  await logAdminAction('lab_session.started', 'lab_session', sessionId, {
    lab_slug: slug,
    pod_name: pod.podName,
  })

  revalidatePath(`/labs/${slug}`)

  return {
    ok: true,
    sessionId,
    sandboxUrl: pod.sandboxUrl,
    expiresAt: result.expires_at ?? pod.expiresAt.toISOString(),
  }
}

export async function endSession(
  sessionId: string,
  reason: 'user_ended' | 'expired' | 'admin_kill' = 'user_ended',
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile) return { ok: false, error: 'not_authenticated' }

  const supabase = await createClient()

  // Récup pod_name avant fermeture
  const { data: row } = await supabase
    .from('lab_sessions')
    .select('k8s_pod_name, lab_slug, user_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (!row) return { ok: false, error: 'not_found' }

  const isOwner = row.user_id === profile.id
  if (!isOwner && profile.role !== 'admin') return { ok: false, error: 'forbidden' }

  const podName = (row.k8s_pod_name as string | null) ?? null
  const slug    = row.lab_slug as string

  // 1. K8s teardown (best-effort, idempotent)
  if (podName && isK8sConfigured()) {
    try { await deleteLabResources(podName) } catch { /* logged below */ }
  }

  // 2. DB
  const { data: rpc, error } = await supabase.rpc('end_lab_session', {
    p_id: sessionId,
    p_reason: reason,
  })

  if (error) return { ok: false, error: error.message }
  const result = rpc as { ok: boolean; error?: string }
  if (!result.ok) return { ok: false, error: result.error }

  await logAdminAction('lab_session.ended', 'lab_session', sessionId, { reason, pod_name: podName })

  revalidatePath(`/labs/${slug}`)
  return { ok: true }
}

export async function getSessionStatus(sessionId: string): Promise<{
  phase: string
  ready: boolean
  endedAt: string | null
  expired: boolean
} | null> {
  // La RLS owner-only s'applique (client utilisateur) : un non-owner non-admin
  // n'obtient aucune ligne et reçoit donc `null`. Pas de garde supplémentaire requise.
  const supabase = await createClient()
  const { data } = await supabase
    .from('lab_sessions')
    .select('k8s_pod_name, ended_at, expires_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (!data) return null

  const expired = new Date(data.expires_at as string).getTime() <= Date.now()
  const endedAt = (data.ended_at as string | null) ?? null
  let phase = 'Unknown'
  if (data.k8s_pod_name && !endedAt && isK8sConfigured()) {
    phase = await getPodPhase(data.k8s_pod_name as string)
  } else if (endedAt) {
    phase = 'Terminated'
  }

  return { phase, ready: phase === 'Running', endedAt, expired }
}
