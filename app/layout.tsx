import type { Metadata } from 'next'
import { Space_Grotesk, Figtree, Space_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import CustomCursor from '@/components/CustomCursor'
import ScrollProgress from '@/components/ScrollProgress'
import FxCanvas from '@/components/FxCanvas'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-display' })
const figtree      = Figtree({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-body' })
const spaceMono    = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'dev.sec.ops — Blog DevSecOps',
  description: 'Infrastructure, Cybersécurité et Réseaux — tutoriels techniques par un étudiant ingénieur DevSecOps.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${figtree.variable} ${spaceMono.variable}`}>
      <body>
        <CustomCursor />
        <ScrollProgress />
        <FxCanvas />
        <Nav />
        {children}
      </body>
    </html>
  )
}
