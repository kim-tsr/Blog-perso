/**
 * Libellés FR pour les codes d'erreur du sandbox éphémère.
 * Partagé entre LabSandboxButton (échec de startSession) et SandboxFrame
 * (pod Failed / provisioning échoué) pour ne pas afficher de code brut à l'user.
 */

const KNOWN: Record<string, string> = {
  not_authenticated: 'Tu dois être connecté pour lancer un sandbox.',
  forbidden: 'Réservé aux admins pour le moment.',
  lab_not_found: 'Lab introuvable.',
  lab_not_sandboxable: 'Ce lab ne propose pas de sandbox.',
  k8s_not_configured: "Le cluster sandbox n'est pas configuré.",
  pod_creation_failed: "La création du container a échoué.",
  rpc_failed: 'La session n\'a pas pu être ouverte.',
  not_found: 'Session introuvable.',
  // Renvoyé par la RPC start_lab_session quand une session est déjà ouverte.
  active_session_exists: 'Une session est déjà ouverte (une seule à la fois).',
  // États surfacés par le polling de readiness côté SandboxFrame.
  pod_failed: 'Le container a échoué au démarrage.',
  provision_timeout: "Le container n'a pas démarré à temps (image absente ou cluster lent).",
}

/**
 * Traduit un code d'erreur en message lisible. Les codes paramétrés
 * (`lab_image_missing:<slug>`, `k8s_404: …`) sont normalisés sur leur préfixe.
 */
export function sandboxErrorLabel(code: string | null | undefined): string {
  if (!code) return 'Une erreur inconnue est survenue.'

  if (code.startsWith('lab_image_missing')) {
    return "Aucune image n'est associée à ce lab."
  }
  // Erreurs API k8s brutes : "k8s_409: ...", "k8s_403: ..." — message générique.
  if (/^k8s_\d{3}/.test(code)) {
    return "Le cluster sandbox a refusé la requête."
  }
  // La RPC peut renvoyer un message contenant "active session".
  if (code.toLowerCase().includes('active session')) {
    return KNOWN.active_session_exists
  }

  return KNOWN[code] ?? `Erreur inattendue (${code}).`
}
