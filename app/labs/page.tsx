import { Metadata } from 'next'
import { getAllLabMeta } from '@/lib/labs'
import Footer from '@/components/Footer'
import LabsClient from './LabsClient'

export const metadata: Metadata = {
  title: 'Labs — dev.sec.ops',
  description: 'Exercices pratiques DevSecOps : Kubernetes, hardening, réseau, SIEM. Chaque lab a un objectif, des prérequis et une validation.',
}

export default function LabsPage() {
  const labs = getAllLabMeta()
  return (
    <>
      <main>
        <LabsClient labs={labs} />
      </main>
      <Footer />
    </>
  )
}
