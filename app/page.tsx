import { getAllArticleMeta } from '@/lib/articles'
import Hero from '@/components/Hero'
import GatewayCards from '@/components/GatewayCards'
import FeaturedArticle from '@/components/FeaturedArticle'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import SideNav from '@/components/SideNav'

export default function Home() {
  const articles = getAllArticleMeta()
  const featured = articles[0]

  return (
    <>
      <SideNav />
      <main>
        <Hero />
        <GatewayCards />
        <div className="beam-sep" aria-hidden="true" />
        {featured && <FeaturedArticle article={featured} />}
        <div className="beam-sep" aria-hidden="true" />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
