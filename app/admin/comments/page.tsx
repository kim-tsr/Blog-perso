import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdminCommentsClient from './AdminCommentsClient'
import type { CommentAdminRow } from './AdminCommentsClient'

export const metadata: Metadata = {
  title: 'Admin · Commentaires — dev.sec.ops',
}

export default async function AdminCommentsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/comments')
  if (profile.role !== 'admin') redirect('/account')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <AdminCommentsClient comments={[]} />
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('comments')
    .select('id, user_id, lab_slug, body, status, created_at')
    .order('created_at', { ascending: false })

  const rows = data ?? []
  const userIds = Array.from(new Set(rows.map(r => r.user_id as string)))
  const profilesById = new Map<string, { name: string | null; email: string | null }>()

  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)
    for (const p of profs ?? []) {
      profilesById.set(p.id as string, { name: p.name as string | null, email: p.email as string | null })
    }
  }

  const comments: CommentAdminRow[] = rows.map(row => {
    const prof = profilesById.get(row.user_id as string)
    return {
      id: row.id,
      user_id: row.user_id,
      author_name: prof?.name ?? null,
      author_email: prof?.email ?? null,
      lab_slug: row.lab_slug,
      body: row.body,
      status: row.status as 'visible' | 'hidden' | 'flagged',
      created_at: row.created_at,
    }
  })

  return <AdminCommentsClient comments={comments} />
}
