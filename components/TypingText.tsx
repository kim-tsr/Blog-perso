'use client'
import { useEffect, useState } from 'react'

// Texte qui se tape caractère par caractère (Typing Animation). Le texte complet reste dans le DOM
// (invisible) pour réserver la hauteur, l'accessibilité et le SEO : pas de décalage de mise en page.
export default function TypingText({ text, speed = 38, delay = 350 }: { text: string; speed?: number; delay?: number }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(text.length)
      return
    }
    let i = 0
    let t: ReturnType<typeof setTimeout>
    const tick = () => { i++; setN(i); if (i < text.length) t = setTimeout(tick, speed + Math.random() * 30) }
    t = setTimeout(tick, delay)
    return () => clearTimeout(t)
  }, [text, speed, delay])

  const done = n >= text.length
  return (
    <span className="tp" style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        .tp-caret { display:inline-block; width:.08em; height:.95em; margin-left:.06em; background:var(--accent); vertical-align:-.1em; animation:tpBlink 1s step-end infinite; }
        @keyframes tpBlink { 50% { opacity:0 } }
      `}</style>
      <span style={{ visibility: 'hidden' }}>{text}</span>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {text.slice(0, n)}<span className="tp-caret" style={done ? undefined : { animation: 'none' }} />
      </span>
    </span>
  )
}
