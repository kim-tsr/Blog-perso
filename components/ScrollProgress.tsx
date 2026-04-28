'use client'
import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (bar.current) bar.current.style.width = (p * 100) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={bar} id="progress" aria-hidden="true" style={{
      position:'fixed', top:0, left:0, height:2,
      background:'linear-gradient(90deg,var(--v),var(--c))',
      zIndex:200, width:'0%', transition:'width 0.1s linear',
    }} />
  )
}
