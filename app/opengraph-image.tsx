import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'Kim Tessier - DevSecOps'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    title: 'Kim Tessier - DevSecOps',
    subtitle: "Stage de fin d'études dès février 2027 · EPITA Rennes",
  })
}
