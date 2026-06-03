'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const ANON_KEY = 'dso.anon'
const IGNORED_PREFIXES = ['/admin', '/auth', '/api']

function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem(ANON_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(ANON_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function classify(path: string): { type: 'lab' | 'project' | 'page'; slug: string } {
  if (path.startsWith('/labs/') && path !== '/labs') {
    return { type: 'lab', slug: path.slice('/labs/'.length) }
  }
  if (path.startsWith('/projets/')) {
    return { type: 'project', slug: path.slice('/projets/'.length) }
  }
  return { type: 'page', slug: path }
}

export default function TrackView() {
  const path = usePathname()

  useEffect(() => {
    if (!path) return
    if (IGNORED_PREFIXES.some(p => path.startsWith(p))) return

    const { type, slug } = classify(path)
    const anon_id = getOrCreateAnonId()
    const body = JSON.stringify({
      event: 'page_view',
      content_type: type,
      content_slug: slug,
      anon_id,
    })

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', blob)
        return
      }
    } catch {}

    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }, [path])

  return null
}
