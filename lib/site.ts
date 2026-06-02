export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://dev-sec-ops.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'dev.sec.ops'
export const SITE_DESCRIPTION = 'Infrastructure, Cybersécurité et Réseaux — tutoriels techniques par un étudiant ingénieur DevSecOps.'
export const SITE_AUTHOR = 'Kim Tessier'
