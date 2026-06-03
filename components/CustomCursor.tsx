'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    let rx = 0, ry = 0, mx = 0, my = 0

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf: number
    const tick = () => {
      if (dot.current)  { dot.current.style.left  = mx + 'px'; dot.current.style.top  = my + 'px' }
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
      if (ring.current) { ring.current.style.left = rx + 'px'; ring.current.style.top = ry + 'px' }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dot} id="cur-dot" aria-hidden="true" style={{
        position:'fixed', width:6, height:6, borderRadius:'50%',
        background:'#fff', pointerEvents:'none', zIndex:9999,
        transform:'translate(-50%,-50%)', mixBlendMode:'difference' as const,
        transition:'transform .15s',
      }} />
      <div ref={ring} id="cur-ring" aria-hidden="true" style={{
        position:'fixed', width:36, height:36, borderRadius:'50%',
        border:'1.5px solid rgba(168,120,255,0.7)', pointerEvents:'none', zIndex:9998,
        transform:'translate(-50%,-50%)',
        transition:'width .35s cubic-bezier(0.16,1,0.3,1), height .35s cubic-bezier(0.16,1,0.3,1), border-color .3s',
      }} />
    </>
  )
}
