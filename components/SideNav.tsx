'use client'
import { useEffect, useRef } from 'react'

const SECTIONS = ['hero','about','pillars','articles','contact']

export default function SideNav() {
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dots = dotsRef.current?.querySelectorAll<HTMLDivElement>('.sn-dot')
    if (!dots) return

    const sections = SECTIONS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).dataset.section
          dots.forEach(d => d.classList.toggle('active', d.dataset.target === id))
        }
      })
    }, { threshold: 0.4 })
    sections.forEach(s => io.observe(s))

    dots.forEach(d => {
      d.addEventListener('click', () => {
        document.getElementById(d.dataset.target!)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    return () => io.disconnect()
  }, [])

  return (
    <>
      <style>{`
        #side-nav { position:fixed; right:28px; left:auto; top:50%; width:auto; padding:0; border:none; background:transparent; transform:translateY(-50%); z-index:90; display:flex; flex-direction:column; gap:10px; align-items:center; }
        .sn-dot { width:5px; height:5px; border-radius:50%; background:var(--dim); cursor:pointer; transition:background .3s, transform .3s, height .3s; }
        .sn-dot.active { background:var(--v); height:20px; border-radius:3px; }
        @media(max-width:768px) { #side-nav { display:none; } }
      `}</style>
      <nav id="side-nav" ref={dotsRef} aria-label="Navigation par section">
        {SECTIONS.map(id => (
          <div key={id} className="sn-dot" data-target={id} tabIndex={0} aria-label={id} />
        ))}
      </nav>
    </>
  )
}
