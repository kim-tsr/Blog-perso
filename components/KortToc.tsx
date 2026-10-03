'use client'
import { useEffect, useState } from 'react'

export default function KortToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (vis) setActive(vis.target.id)
    }, { rootMargin: '-20% 0px -65% 0px' })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [items])

  return (
    <nav className="toc" aria-label="Sommaire">
      <style>{`
        .toc { position:sticky; top:110px; align-self:start; font-size:14px; }
        .toc p { font-size:12px; font-weight:600; color:var(--dim); text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px; }
        .toc ul { list-style:none; border-left:1px solid var(--border); }
        .toc a { display:block; padding:6px 0 6px 14px; margin-left:-1px; border-left:2px solid transparent; color:var(--dim); line-height:1.4; transition:color .15s, border-color .15s; }
        .toc a:hover { color:var(--ink); }
        .toc a.on { color:var(--ink); font-weight:600; border-left-color:var(--accent); }
        @media (max-width:1000px) { .toc { display:none; } }
      `}</style>
      <p>Sommaire</p>
      <ul>
        {items.map(i => (
          <li key={i.id}><a href={`#${i.id}`} className={active === i.id ? 'on' : ''}>{i.label}</a></li>
        ))}
      </ul>
    </nav>
  )
}
