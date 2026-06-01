import { getCurrentProfile } from '@/lib/auth'
import NavClient from './NavClient'

export default async function Nav() {
  const profile = await getCurrentProfile()
  return <NavClient profile={profile} />
}
