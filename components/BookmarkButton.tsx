import { toggleBookmarkForm, isBookmarked, type BookmarkType } from '@/lib/bookmarks'
import { createClient } from '@/lib/supabase/server'

interface Props {
  type: BookmarkType
  slug: string
  variant?: 'pill' | 'icon'
}

export default async function BookmarkButton({ type, slug, variant = 'pill' }: Props) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const bookmarked = await isBookmarked(type, slug)

  return (
    <form action={toggleBookmarkForm} style={{ display: 'inline-flex' }}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="slug" value={slug} />
      <style>{`
        .bm-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px;
          border-radius: 100px;
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          color: var(--dim);
          font-family: var(--fm);
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color .2s, border-color .2s, background .2s;
        }
        .bm-btn:hover { color: var(--text); border-color: rgba(255,255,255,.18); background: rgba(255,255,255,.04); }
        .bm-btn.active { color: var(--a); border-color: color-mix(in oklab, var(--a) 35%, var(--border)); background: color-mix(in oklab, var(--a) 10%, transparent); }
        .bm-btn svg { width: 12px; height: 12px; }
        .bm-icon { width: 32px; height: 32px; padding: 0; justify-content: center; gap: 0; }
        .bm-icon svg { width: 14px; height: 14px; }
      `}</style>
      <button
        type="submit"
        className={`bm-btn ${bookmarked ? 'active' : ''} ${variant === 'icon' ? 'bm-icon' : ''}`}
        aria-label={bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        title={bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <svg viewBox="0 0 16 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M3 2v12l5-3.5L13 14V2H3z" strokeLinejoin="round" />
        </svg>
        {variant === 'pill' && <span>{bookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>}
      </button>
    </form>
  )
}
