import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminClient } from '@/lib/admin'
import { getAllCategories } from '@/lib/categories'
import LabForm from '@/components/admin/LabForm'
import { updateLab, deleteLab } from '../../actions'

export const metadata: Metadata = { title: 'Éditer un lab — admin' }

interface LabRow {
  id: string
  slug: string
  title: string
  objective: string
  content: string
  category_slug: string | null
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
  duration: string
  prerequisites: string[]
  tools: string[]
  min_role: 'free' | 'pro' | 'admin'
  published: boolean
  scheduled_for: string | null
}

export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdminClient()
  const { data } = await supabase
    .from('labs')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!data) notFound()
  const lab = data as LabRow

  const categories = await getAllCategories()
  const boundUpdate = async (fd: FormData) => { 'use server'; await updateLab(id, fd) }
  const boundDelete = async () => { 'use server'; await deleteLab(id) }

  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:960, margin:'0 auto' }}>
      <Link href="/admin/labs" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Labs</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 6px' }}>{lab.title}</h1>
      <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', marginBottom:36 }}>/{lab.slug}</div>
      <LabForm
        mode="edit"
        action={boundUpdate}
        onDelete={boundDelete}
        categories={categories.map(c => ({ slug: c.slug, label: c.label }))}
        initial={{
          id:            lab.id,
          slug:          lab.slug,
          title:         lab.title,
          objective:     lab.objective,
          content:       lab.content,
          category_slug: lab.category_slug ?? 'infra',
          difficulty:    lab.difficulty,
          duration:      lab.duration,
          prerequisites: lab.prerequisites ?? [],
          tools:         lab.tools ?? [],
          min_role:      lab.min_role,
          published:     lab.published,
          scheduled_for: lab.scheduled_for,
        }}
      />
    </div>
  )
}
