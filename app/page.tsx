import Hero from '@/components/Hero'
import Timeline from '@/components/Timeline'
import HomeCTA from '@/components/HomeCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Timeline />
        <HomeCTA />
      </main>
      <Footer />
    </>
  )
}
