import { randomBytes } from 'crypto'

/**
 * Génère un code lisible et copy-pastable au format DSO-XXXX-XXXX.
 * Évite les caractères ambigus (0/O, 1/I/L) et reste en majuscules.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function block(len: number) {
  const bytes = randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

export function generateAccessCode(prefix = 'DSO'): string {
  return `${prefix}-${block(4)}-${block(4)}`
}

export const REDEEM_ERRORS: Record<string, string> = {
  not_authenticated: 'Vous devez être connecté pour activer un code.',
  empty_code:        'Saisissez un code.',
  profile_missing:   'Profil introuvable. Reconnectez-vous.',
  invalid_code:      'Ce code n\'existe pas.',
  disabled:          'Ce code a été désactivé.',
  expired:           'Ce code a expiré.',
  exhausted:         'Ce code a déjà été utilisé le nombre maximum de fois.',
  already_redeemed:  'Vous avez déjà activé ce code.',
  unknown:           'Une erreur inconnue est survenue.',
}
