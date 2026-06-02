import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase "anon" sans contexte cookie — pour les lectures publiques
 * côté serveur (loaders de contenu publié). Les RLS s'appliquent comme pour
 * un visiteur non authentifié, ce qui est exactement ce qu'on veut :
 * seul le contenu published = true est visible.
 */
export function createPublicClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
}
