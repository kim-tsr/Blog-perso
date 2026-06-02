import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminClient } from '@/lib/admin'
import { getAllCategories } from '@/lib/categories'
import ProjectForm from '@/components/admin/ProjectForm'
import { updateProject, deleteProject } from '../../actions'

interface Row {
  id: string
  title: string
  description: string
  tags: string[]
  category_slug: string | null
  status: 'live' | 'beta' | 'wip' | 'archive'
  year: string | null
  github_url: string | null
  live_url: string | null
  display_order: number
  published: boolean
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdminClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  const p = data as Row

  const categories = await getAllCategories()
  const boundUpdate = async (fd: FormData) => { 'use server'; await updateProject(id, fd) }
  const boundDelete = async () => { 'use server'; await deleteProject(id) }

  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:880, margin:'0 auto' }}>
      <Link href="/admin/projects" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Projets</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>{p.title}</h1>
      <ProjectForm
        mode="edit"
        action={boundUpdate}
        onDelete={boundDelete}
        categories={categories.map(c => ({ slug: c.slug, label: c.label }))}
        initial={{
          id:            p.id,
          title:         p.title,
          description:   p.description,
          tags:          p.tags ?? [],
          category_slug: p.category_slug,
          status:        p.status,
          year:          p.year,
          github_url:    p.github_url,
          live_url:      p.live_url,
          display_order: p.display_order,
          published:     p.published,
        }}
      />
    </div>
  )
}
