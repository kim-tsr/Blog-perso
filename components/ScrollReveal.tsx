'use client'
import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  clip?: boolean
}

export default function ScrollReveal({ children, className = '', delay = 0, clip = false }: Props) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        io.unobserve(entry.target)
      }
    }, { threshold: 0.1 })
    if (el.current) io.observe(el.current)
    return () => io.disconnect()
  }, [])

  if (clip) {
    return (
      <div className={`clip-wrap ${className}`} ref={el}>
        <div className="clip-inner" style={delay ? { transitionDelay: `${delay}s` } : undefined}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={el}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
