import { getAllLabMeta } from '@/lib/labs'
import Hero from '@/components/Hero'
import GatewayCards from '@/components/GatewayCards'
import FeaturedLab from '@/components/FeaturedLab'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import SideNav from '@/components/SideNav'
import HomeStats from '@/components/HomeStats'
import RoadmapPreview from '@/components/RoadmapPreview'
import LabsPreview from '@/components/LabsPreview'

export default async function Home() {
  const labs = await getAllLabMeta()
  const featured = labs[0]

  const seriesCount = new Set(labs.filter(l => l.series).map(l => l.series)).size

  const stats = [
    { num: String(labs.length),    label: 'Labs publiés',  detail: 'Théorie + pratique + quiz.', color: 'var(--c)' },
    { num: String(seriesCount),    label: 'Parcours',      detail: 'Séries de labs chaînés.',     color: 'var(--v)' },
    { num: '6',                    label: 'Projets actifs', detail: 'Open-source & homelab.',     color: 'var(--a)' },
    { num: '1/sem',                label: 'Rythme',         detail: 'Un nouveau lab / semaine.',   color: 'var(--text)' },
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
        {featured && <FeaturedLab lab={featured} />}
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
