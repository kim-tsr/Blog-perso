import Link from 'next/link'
import type { Profile } from '@/lib/auth'
import { getCommentsForLab, submitCommentForm, editCommentForm, deleteCommentForm } from '@/lib/comments'
import { moderateCommentAction } from '@/app/admin/comments/actions'
import CommentForm from './CommentForm'
import { CommentRowActions } from './CommentActions'

interface Props {
  slug: string
  currentProfile: Profile | null
  searchParams?: Record<string, string | string[] | undefined>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'à l\'instant'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  const months = Math.floor(days / 30)
  if (months < 12) return `il y a ${months} mois`
  return `il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? 's' : ''}`
}

function avatarInitial(name: string | null): string {
  if (!name) return '?'
  return name.trim()[0].toUpperCase()
}

export default async function Comments({ slug, currentProfile, searchParams }: Props) {
  const page = Number((searchParams?.cpage as string) ?? '1') || 1
  const { comments, total } = await getCommentsForLab(slug, page, 20)

  const isAdmin = currentProfile?.role === 'admin'
  const isLoggedIn = !!currentProfile

  const totalPages = Math.ceil(total / 20)
  const hasMore = page < totalPages

  return (
    <section className="cm-wrap">
      <style>{`
        .cm-wrap { max-width:1100px; margin:60px auto 0; padding:0 48px; }
        @media(max-width:768px) { .cm-wrap { padding:0 24px; } }

        .cm-header { display:flex; align-items:baseline; gap:12px; margin-bottom:28px; }
        .cm-title { font-family:var(--fm); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--v); }
        .cm-count { font-family:var(--fm); font-size:11px; color:var(--dim); }

        .cm-list { display:flex; flex-direction:column; gap:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); margin-bottom:28px; }
        .cm-item { padding:20px 22px; border-bottom:1px solid var(--border); }
        .cm-item:last-child { border-bottom:none; }
        .cm-item-hidden { opacity:.5; }

        .cm-row-top { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
        .cm-avatar {
          width:30px; height:30px; border-radius:50%; flex-shrink:0;
          background:color-mix(in oklab, var(--v) 20%, rgba(255,255,255,.06));
          border:1px solid color-mix(in oklab, var(--v) 30%, var(--border));
          display:flex; align-items:center; justify-content:center;
          font-family:var(--fd); font-size:12px; font-weight:700; color:var(--v);
        }
        .cm-author { font-family:var(--fb); font-size:13px; font-weight:600; color:var(--text); }
        .cm-time { font-family:var(--fm); font-size:11px; color:var(--dim); margin-left:auto; }
        .cm-edited-tag { font-family:var(--fm); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--dim); padding:2px 7px; border:1px solid var(--border); border-radius:100px; }
        .cm-status-badge { font-family:var(--fm); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; padding:2px 8px; border-radius:100px; }

        .cm-body { font-size:14px; color:var(--mid); line-height:1.65; word-break:break-word; white-space:pre-wrap; }

        .cm-empty { padding:32px 22px; text-align:center; color:var(--dim); font-family:var(--fm); font-size:12px; letter-spacing:.08em; font-style:italic; }

        .cm-pagination { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
        .cm-page-link { padding:8px 16px; border:1px solid var(--border); border-radius:100px; font-family:var(--fm); font-size:11px; letter-spacing:.1em; color:var(--mid); background:rgba(255,255,255,.018); transition:color .2s, border-color .2s; }
        .cm-page-link:hover { color:var(--text); border-color:rgba(255,255,255,.18); }

        .cm-form-section { }
        .cm-form-title { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-bottom:14px; }
        .cm-signin-cta { display:inline-flex; align-items:center; gap:8px; padding:12px 20px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.022); font-size:13px; color:var(--mid); transition:color .2s, border-color .2s, background .2s; }
        .cm-signin-cta:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .cm-signin-cta-text { font-family:var(--fb); }
        .cm-signin-cta-link { color:var(--v); font-weight:600; }
      `}</style>

      <div className="cm-header">
        <span className="cm-title">// discussion</span>
        <span className="cm-count">· {total} commentaire{total > 1 ? 's' : ''}</span>
      </div>

      {comments.length > 0 ? (
        <div className="cm-list">
          {comments.map(comment => (
            <div
              key={comment.id}
              className={`cm-item${comment.status !== 'visible' ? ' cm-item-hidden' : ''}`}
            >
              <div className="cm-row-top">
                <div className="cm-avatar" aria-hidden="true">
                  {avatarInitial(comment.author_name)}
                </div>
                <span className="cm-author">{comment.author_name ?? 'Anonyme'}</span>
                {comment.is_edited && (
                  <span className="cm-edited-tag">modifié</span>
                )}
                {isAdmin && comment.status !== 'visible' && (
                  <span
                    className="cm-status-badge"
                    style={{
                      color: comment.status === 'flagged' ? 'oklch(0.72 0.18 25)' : 'var(--dim)',
                      border: `1px solid ${comment.status === 'flagged' ? 'oklch(0.72 0.18 25 / .4)' : 'var(--border)'}`,
                      background: comment.status === 'flagged' ? 'oklch(0.72 0.18 25 / .08)' : 'transparent',
                    }}
                  >
                    {comment.status === 'hidden' ? 'masqué' : 'signalé'}
                  </span>
                )}
                <span className="cm-time">{timeAgo(comment.created_at)}</span>
              </div>

              <p className="cm-body">{comment.body}</p>

              <CommentRowActions
                id={comment.id}
                slug={slug}
                body={comment.body}
                isOwn={comment.is_own}
                isAdmin={isAdmin}
                status={comment.status}
                editAction={editCommentForm}
                deleteAction={deleteCommentForm}
                moderateAction={moderateCommentAction}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="cm-list">
          <div className="cm-empty">Aucun commentaire pour l&apos;instant. Sois le premier !</div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="cm-pagination">
          {page > 1 && (
            <Link href={`?cpage=${page - 1}`} className="cm-page-link">
              ← Précédent
            </Link>
          )}
          <span style={{ padding: '8px 12px', fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--dim)' }}>
            Page {page} / {totalPages}
          </span>
          {hasMore && (
            <Link href={`?cpage=${page + 1}`} className="cm-page-link">
              Voir plus →
            </Link>
          )}
        </div>
      )}

      <div className="cm-form-section">
        <div className="cm-form-title">// laisser un commentaire</div>
        {isLoggedIn ? (
          <CommentForm slug={slug} action={submitCommentForm} />
        ) : (
          <div className="cm-signin-cta">
            <span className="cm-signin-cta-text">
              <Link href={`/auth/signin?next=/labs/${slug}`} className="cm-signin-cta-link">
                Connecte-toi
              </Link>{' '}
              pour laisser un commentaire.
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
