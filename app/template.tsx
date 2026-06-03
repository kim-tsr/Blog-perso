'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { getCatOrigin } from '@/lib/catOrigin'
import { getPageOrigin } from '@/lib/pageOrigin'
import TrackView from '@/components/TrackView'

const isArticle  = (p: string) => p.startsWith('/articles/') && p !== '/articles'
const isCategory = (p: string) => p.startsWith('/categories/')
const isMainPage = (p: string) => ['/blog', '/projets', '/a-propos'].includes(p)

export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  useEffect(() => {
    if (isCategory(path)) {
      const o = getCatOrigin()
      if (o) setOrigin(o)
    } else if (isMainPage(path)) {
      const o = getPageOrigin()
      if (o) setOrigin(o)
    }
  }, [path])

  if (isArticle(path)) {
    return (
      <>
        <TrackView />
        <motion.div
          initial={{ y: '8%', opacity: 0 }}
          animate={{ y: 0,    opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </>
    )
  }

  if (isCategory(path) || isMainPage(path)) {
    const at = `${origin.x}% ${origin.y}%`
    return (
      <>
        <TrackView />
        <motion.div
          initial={{ clipPath: `circle(0% at ${at})` }}
          animate={{ clipPath: `circle(170% at ${at})` }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'var(--bg)' }}
        >
          {children}
        </motion.div>
      </>
    )
  }

  return (
    <>
      <TrackView />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  )
}
