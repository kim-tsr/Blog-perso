'use client'
import { useEffect, useRef } from 'react'

interface Pt { x: number; y: number; vx: number; vy: number; r: number }

function isLightTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light'
}

export default function HeroCanvas() {
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = cv.current!
    const ctx = canvas.getContext('2d')!
    const N = 90, DIST = 140
    let W = 0, H = 0
    let pts: Pt[] = []
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      W = canvas.width  = canvas.parentElement?.offsetWidth  ?? window.innerWidth
      H = canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
        r: Math.random() * 1.6 + .4,
      }))
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const light = isLightTheme()
      // In light mode use darker violet tones and reduced alpha so particles
      // remain visible without oversaturating the warm off-white background.
      const lineAlphaMax = light ? 0.10 : 0.18
      const dotColor     = light ? 'rgba(90,50,180,' : 'rgba(168,140,255,'
      const dotAlpha     = light ? 0.25 : 0.40

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const md = Math.hypot(dx, dy)
        if (md < 120 && md > 0) { p.x += dx / md * 1.8; p.y += dy / md * 1.8 }
      })
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < DIST) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${light ? '90,50,180' : '168,140,255'},${(1 - d/DIST) * lineAlphaMax})`
            ctx.lineWidth = .7
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = `${dotColor}${dotAlpha})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }

    const hero = canvas.parentElement!
    const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    hero.addEventListener('mousemove', onMove, { passive: true })
    hero.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize, { passive: true })
    resize()
    draw()

    return () => {
      cancelAnimationFrame(raf)
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={cv} id="hero-canvas" aria-hidden="true" style={{ position:'absolute', inset:0, zIndex:1, width:'100%', height:'100%' }} />
}
