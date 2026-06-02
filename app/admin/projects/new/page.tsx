import Link from 'next/link'
import { getAllCategories } from '@/lib/categories'
import ProjectForm from '@/components/admin/ProjectForm'
import { createProject } from '../actions'

export default async function NewProjectPage() {
  const categories = await getAllCategories()
  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:880, margin:'0 auto' }}>
      <Link href="/admin/projects" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Projets</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:32, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>Nouveau projet</h1>
      <ProjectForm mode="create" action={createProject} categories={categories.map(c => ({ slug: c.slug, label: c.label }))} />
    </div>
  )
}
