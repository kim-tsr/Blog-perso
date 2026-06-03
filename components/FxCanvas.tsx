'use client'
import { useEffect, useRef } from 'react'

interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; col: string }
interface Shape3D { verts: number[][]; edges: [number,number][]; x: number; y: number; z: number; rx: number; ry: number; rz: number; drx: number; dry: number; drz: number; col: string }

function makeShape(type: 'cube'|'octahedron'|'ring', x: number, y: number, col: string): Shape3D {
  let verts: number[][] = []
  let edges: [number,number][] = []
  if (type === 'cube') {
    verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
    edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
  } else if (type === 'octahedron') {
    verts = [[0,1.4,0],[1,0,1],[1,0,-1],[-1,0,-1],[-1,0,1],[0,-1.4,0]]
    edges = [[0,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4],[1,2],[2,3],[3,4],[4,1]]
  } else {
    const n = 12
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      verts.push([Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0])
    }
    for (let i = 0; i < n; i++) edges.push([i, (i+1) % n])
  }
  return { verts, edges, x, y, z: 0, rx: Math.random() * Math.PI * 2, ry: Math.random() * Math.PI * 2, rz: 0, drx: (Math.random()-0.5)*0.008, dry: (Math.random()-0.5)*0.009, drz: (Math.random()-0.5)*0.004, col }
}

export default function FxCanvas() {
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!cv.current) return
    const canvas = cv.current
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    let mx = -9999, my = -9999
    let aurax = -9999, auray = -9999
    const sparks: Spark[] = []

    // Light-mode uses darker, more saturated versions of the accent colors
    // so they remain visible on the warm off-white background.
    const SPARK_COLS_DARK  = ['oklch(0.68 0.24 280)', 'oklch(0.75 0.16 194)', 'oklch(0.76 0.16 65)']
    const SPARK_COLS_LIGHT = ['oklch(0.48 0.24 280)', 'oklch(0.45 0.18 194)', 'oklch(0.50 0.18 65)']

    let shapes: Shape3D[] = []

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light'

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      const light = isLight()
      shapes = [
        makeShape('octahedron', W * 0.85, H * 0.3, light ? 'oklch(0.48 0.24 280)' : 'oklch(0.68 0.24 280)'),
        makeShape('ring',       W * 0.12, H * 0.7, light ? 'oklch(0.45 0.18 194)' : 'oklch(0.75 0.16 194)'),
      ]
    }

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onThemeChange = () => resize()
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('themechange', onThemeChange)
    resize()

    const rotX = (v: number[], a: number) => [v[0], v[1]*Math.cos(a)-v[2]*Math.sin(a), v[1]*Math.sin(a)+v[2]*Math.cos(a)]
    const rotY = (v: number[], a: number) => [v[0]*Math.cos(a)+v[2]*Math.sin(a), v[1], -v[0]*Math.sin(a)+v[2]*Math.cos(a)]
    const rotZ = (v: number[], a: number) => [v[0]*Math.cos(a)-v[1]*Math.sin(a), v[0]*Math.sin(a)+v[1]*Math.cos(a), v[2]]

    function drawShape(sh: Shape3D) {
      const light = isLight()
      const s = 55
      const proj = sh.verts.map(v => {
        let p = rotX(v, sh.rx)
        p = rotY(p, sh.ry)
        p = rotZ(p, sh.rz)
        const fov = 4 / (4 + p[2])
        return [sh.x + p[0] * s * fov, sh.y + p[1] * s * fov]
      })
      sh.edges.forEach(([a, b]) => {
        ctx.beginPath()
        // In light mode reduce glow (thick pass) alpha and bump fine line alpha
        ctx.strokeStyle = sh.col.replace(')', light ? ' / 0.07)' : ' / 0.12)')
        ctx.lineWidth = 4
        ctx.moveTo(proj[a][0], proj[a][1])
        ctx.lineTo(proj[b][0], proj[b][1])
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = sh.col.replace(')', light ? ' / 0.45)' : ' / 0.55)')
        ctx.lineWidth = 0.8
        ctx.moveTo(proj[a][0], proj[a][1])
        ctx.lineTo(proj[b][0], proj[b][1])
        ctx.stroke()
      })
      sh.rx += sh.drx; sh.ry += sh.dry; sh.rz += sh.drz
    }

    let raf: number
    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const light = isLight()
      const SPARK_COLS = light ? SPARK_COLS_LIGHT : SPARK_COLS_DARK

      aurax += (mx - aurax) * 0.06; auray += (my - auray) * 0.06
      if (mx > 0) {
        const auraAlpha = light ? '0.04' : '0.06'
        const g = ctx.createRadialGradient(aurax, auray, 0, aurax, auray, 200)
        g.addColorStop(0, `oklch(${light ? '0.50 0.24 280' : '0.68 0.24 280'} / ${auraAlpha})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(aurax, auray, 200, 0, Math.PI*2); ctx.fill()
      }

      if (mx > 0 && Math.random() < 0.35) {
        sparks.push({ x: mx + (Math.random()-0.5)*8, y: my + (Math.random()-0.5)*8,
          vx: (Math.random()-0.5)*2.5, vy: (Math.random()-0.5)*2.5 - 0.8,
          life: 1, maxLife: 1, col: SPARK_COLS[Math.floor(Math.random()*3)] })
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i]
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.06; sp.life -= 0.04
        if (sp.life <= 0) { sparks.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, 1.5 * sp.life, 0, Math.PI*2)
        ctx.fillStyle = sp.col.replace(')', ` / ${sp.life * (light ? 0.5 : 0.7)})`)
        ctx.fill()
      }

      shapes.forEach(drawShape)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      window.removeEventListener('themechange', onThemeChange)
    }
  }, [])

  return <canvas ref={cv} id="fx-canvas" aria-hidden="true" style={{ position:'fixed', inset:0, zIndex:50, pointerEvents:'none' }} />
}
