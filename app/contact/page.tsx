import type { Metadata } from 'next'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Stage de fin d’études DevSecOps / sécurité des infrastructures à partir de février 2027.',
}

export default function ContactPage() {
  return (
    <>
      <main style={{ paddingTop: 40 }}>
        <Contact id="contact-page" />
      </main>
      <Footer />
    </>
  )
}
