import { getAllArticleMeta } from '@/lib/articles'
import { getAllLabMeta } from '@/lib/labs'
import Hero from '@/components/Hero'
import GatewayCards from '@/components/GatewayCards'
import FeaturedArticle from '@/components/FeaturedArticle'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import SideNav from '@/components/SideNav'
import HomeStats from '@/components/HomeStats'
import RoadmapPreview from '@/components/RoadmapPreview'
import LabsPreview from '@/components/LabsPreview'

export default function Home() {
  const articles = getAllArticleMeta()
  const labs = getAllLabMeta()
  const featured = articles[0]

  const stats = [
    { num: String(articles.length), label: 'Articles publiés', detail: 'Et la roadmap s\'étend.', color: 'var(--v)' },
    { num: String(labs.length),     label: 'Labs pratiques',   detail: 'Pour passer à l\'action.', color: 'var(--c)' },
    { num: '6',                     label: 'Projets actifs',   detail: 'Open-source & homelab.',   color: 'var(--a)' },
    { num: '1/sem',                 label: 'Rythme',           detail: 'Un nouvel article / semaine.', color: 'var(--text)' },
  ]

  return (
    <>
      <SideNav />
      <main>
        <Hero />
        <GatewayCards />
        <div className="beam-sep" aria-hidden="true" />
        <HomeStats stats={stats} />
        <div className="beam-sep" aria-hidden="true" />
        {featured && <FeaturedArticle article={featured} />}
        <div className="beam-sep" aria-hidden="true" />
        <LabsPreview labs={labs} />
        <div className="beam-sep" aria-hidden="true" />
        <RoadmapPreview />
        <div className="beam-sep" aria-hidden="true" />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
