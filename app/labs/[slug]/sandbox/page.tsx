import { redirect, notFound } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { getLabBySlug } from '@/lib/labs'
import { getActiveSession } from '@/lib/lab-sessions'
import SandboxFrame from './SandboxFrame'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sandbox — dev.sec.ops',
  robots: { index: false, follow: false },
}

export default async function SandboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const profile = await getCurrentProfile()
  if (!profile) redirect(`/auth/signin?next=/labs/${slug}/sandbox`)
  if (profile.role !== 'admin') redirect(`/labs/${slug}`)

  const lab = await getLabBySlug(slug)
  if (!lab) notFound()
  if (!lab.sandboxable) redirect(`/labs/${slug}`)

  const session = await getActiveSession()
  if (!session || session.labSlug !== slug || !session.sandboxUrl) {
    redirect(`/labs/${slug}`)
  }

  // Token sanity : si le query param ne matche pas la session DB, on remet le bon
  if (sp.session && sp.session !== session.id) {
    redirect(`/labs/${slug}/sandbox?session=${session.id}`)
  }

  return (
    <SandboxFrame
      slug={slug}
      labTitle={lab.title}
      sessionId={session.id}
      sandboxUrl={session.sandboxUrl}
      expiresAt={session.expiresAt}
    />
  )
}
