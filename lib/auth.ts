import { createClient } from '@/lib/supabase/server'

export type UserRole = 'free' | 'pro' | 'admin'

export interface Profile {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  role: UserRole
}

const ROLE_RANK: Record<UserRole, number> = { free: 0, pro: 1, admin: 2 }

export function hasRole(userRole: UserRole | null, required: UserRole): boolean {
  if (!userRole) return required === 'free'
  return ROLE_RANK[userRole] >= ROLE_RANK[required]
}

/**
 * Récupère le profil de l'utilisateur connecté (ou null).
 * Si le profil n'existe pas en DB (trigger raté, backfill oublié),
 * on l'insère à la volée — toujours en 'free', jamais en 'admin'/'pro'.
 * Tolérant à l'absence de configuration Supabase pour le dev local.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_url, role')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[getCurrentProfile] SELECT failed:', error)
    }

    if (profile) return profile as Profile

    // Profil manquant → on tente de l'insérer (RLS l'autorise pour soi-même)
    const fallback: Profile = {
      id: user.id,
      email: user.email ?? null,
      name: (user.user_metadata?.full_name ?? user.user_metadata?.name) ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: 'free',
    }

    const { data: inserted } = await supabase
      .from('profiles')
      .insert({
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        avatar_url: fallback.avatar_url,
      })
      .select('id, email, name, avatar_url, role')
      .maybeSingle()

    return (inserted as Profile) ?? fallback
  } catch {
    return null
  }
}
