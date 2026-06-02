import { Metadata } from 'next'
import Link from 'next/link'
import { getAllCategories } from '@/lib/categories'
import LabForm from '@/components/admin/LabForm'
import { createLab } from '../actions'

export const metadata: Metadata = { title: 'Nouveau lab — admin' }

export default async function NewLabPage() {
  const categories = await getAllCategories()
  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:960, margin:'0 auto' }}>
      <Link href="/admin/labs" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Labs</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:32, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>
        Nouveau lab
      </h1>
      <LabForm mode="create" action={createLab} categories={categories.map(c => ({ slug: c.slug, label: c.label }))} />
    </div>
  )
}
