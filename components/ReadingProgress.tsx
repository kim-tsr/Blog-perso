'use client'
import { useEffect, useRef } from 'react'

export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${pct / 100})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div aria-hidden="true" style={{ position:'fixed', top:0, left:0, right:0, height:2, zIndex:200, pointerEvents:'none' }}>
      <div
        ref={bar}
        style={{
          height:'100%',
          background:'linear-gradient(90deg,var(--v),var(--c))',
          transform:'scaleX(0)',
          transformOrigin:'left',
          transition:'transform .15s linear',
        }}
      />
    </div>
  )
}
