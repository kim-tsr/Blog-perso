import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdminUsersClient from './AdminUsersClient'

export const metadata: Metadata = {
  title: 'Admin · Utilisateurs — dev.sec.ops',
}

export interface UserRow {
  id: string
  email: string | null
  name: string | null
  role: 'free' | 'pro' | 'admin'
  created_at: string
  labs_completed: number
  labs_started: number
  bookmarks_count: number
  codes_redeemed: number
}

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/users')
  if (profile.role !== 'admin') redirect('/account')

  const supabase = await createClient()
  const { data } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('created_at', { ascending: false })

  const users = (data ?? []) as UserRow[]

  return <AdminUsersClient users={users} currentUserId={profile.id} />
}
