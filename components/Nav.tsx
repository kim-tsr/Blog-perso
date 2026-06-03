import { getCurrentProfile } from '@/lib/auth'
import { getAllLabMeta } from '@/lib/labs'
import NavClient from './NavClient'

export default async function Nav() {
  const [profile, labs] = await Promise.all([
    getCurrentProfile(),
    getAllLabMeta(),
  ])
  return <NavClient profile={profile} labs={labs} />
}
