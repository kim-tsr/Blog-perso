import type { Metadata } from 'next'
import { Space_Grotesk, Figtree, Space_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import CustomCursor from '@/components/CustomCursor'
import ScrollProgress from '@/components/ScrollProgress'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_AUTHOR } from '@/lib/site'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-display' })
const figtree      = Figtree({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-body' })
const spaceMono    = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Blog DevSecOps`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  keywords: ['devsecops', 'kubernetes', 'sécurité', 'infrastructure', 'réseau', 'homelab', 'wireguard', 'falco', 'argocd'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Blog DevSecOps`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Blog DevSecOps`,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${figtree.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: resolve theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('theme')||'system';var r=m==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;document.documentElement.setAttribute('data-theme',r);document.documentElement.dataset.themeMode=m;}catch(e){}})();` }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Aller au contenu</a>
        <CustomCursor />
        <ScrollProgress />
        <Nav />
        <div id="main">{children}</div>
      </body>
    </html>
  )
}
