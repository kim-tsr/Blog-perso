export function setCatOrigin(x: number, y: number) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('cat-origin', JSON.stringify({ x, y }))
  }
}

export function getCatOrigin(): { x: number; y: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const v = sessionStorage.getItem('cat-origin')
    return v ? JSON.parse(v) : null
  } catch { return null }
}
