import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import AdminCodesClient from './AdminCodesClient'

export const metadata: Metadata = {
  title: 'Admin · Codes d\'accès — dev.sec.ops',
}

export interface AccessCodeRow {
  code: string
  grants_role: 'free' | 'pro' | 'admin'
  description: string | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  disabled: boolean
  created_at: string
  redeemed_count?: number
}

export interface RedemptionRow {
  id: string
  code: string
  user_id: string
  previous_role: 'free' | 'pro' | 'admin'
  granted_role:  'free' | 'pro' | 'admin'
  redeemed_at: string
}

export default async function AdminCodesPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/codes')
  if (profile.role !== 'admin') redirect('/account')

  const supabase = await createClient()

  const { data: codesData } = await supabase
    .from('access_codes_with_stats')
    .select('*')
    .order('created_at', { ascending: false })

  const codes = (codesData ?? []) as AccessCodeRow[]

  const { data: redemptionsData } = await supabase
    .from('code_redemptions')
    .select('*')
    .order('redeemed_at', { ascending: false })
    .limit(20)

  const redemptions = (redemptionsData ?? []) as RedemptionRow[]

  return (
    <>
      <main>
        <AdminCodesClient codes={codes} redemptions={redemptions} />
      </main>
      <Footer />
    </>
  )
}
