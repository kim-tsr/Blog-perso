export function setPageOrigin(x: number, y: number) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('page-origin', JSON.stringify({ x, y }))
  }
}

export function getPageOrigin(): { x: number; y: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const v = sessionStorage.getItem('page-origin')
    return v ? JSON.parse(v) : null
  } catch { return null }
}
