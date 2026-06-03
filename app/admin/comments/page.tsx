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

  // Fetch all comments with joined profile info
  const { data } = await supabase
    .from('comments')
    .select('id, user_id, lab_slug, body, status, created_at, profiles(name, email)')
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments: CommentAdminRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    author_name: row.profiles?.name ?? null,
    author_email: row.profiles?.email ?? null,
    lab_slug: row.lab_slug,
    body: row.body,
    status: row.status as 'visible' | 'hidden' | 'flagged',
    created_at: row.created_at,
  }))

  return <AdminCommentsClient comments={comments} />
}
