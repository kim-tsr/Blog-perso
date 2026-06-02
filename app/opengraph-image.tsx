import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'dev.sec.ops — Blog DevSecOps'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    title: 'dev.sec.ops',
    subtitle: 'Infrastructure, Cybersécurité et Réseaux — tutoriels techniques par un étudiant ingénieur DevSecOps.',
    kind: 'home',
    theme: 'violet',
    meta: '// 7 articles · 17 labs · 6 projets',
  })
}
