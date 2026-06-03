'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { editCommentForm, deleteCommentForm } from '@/lib/comments'

const MAX_CHARS = 4000

interface EditProps {
  id: number
  slug: string
  initialBody: string
  onCancel: () => void
  action: typeof editCommentForm
}

export function CommentEditForm({ id, slug, initialBody, onCancel, action }: EditProps) {
  const router = useRouter()
  const [body, setBody] = useState(initialBody)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || pending) return
    setError(null)
    const fd = new FormData()
    fd.set('id', String(id))
    fd.set('slug', slug)
    fd.set('body', body)
    startTransition(async () => {
      const result = await action(fd)
      if (!result.ok) {
        setError(result.error ?? 'Erreur inconnue')
        return
      }
      router.refresh()
      onCancel()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="cea-edit-form">
      <style>{`
        .cea-edit-form { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
        .cea-textarea {
          width:100%; min-height:80px; padding:12px 14px;
          border:1px solid var(--v); border-radius:10px;
          background:rgba(255,255,255,.03); color:var(--text);
          font-family:var(--fb); font-size:13px; line-height:1.6;
          resize:vertical; outline:none; box-sizing:border-box;
        }
        .cea-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .cea-btn-save {
          padding:7px 16px; border-radius:100px; background:var(--v); color:#fff;
          border:none; font-family:var(--fb); font-size:12px; font-weight:600;
          cursor:pointer; transition:opacity .2s;
        }
        .cea-btn-save:disabled { opacity:.55; cursor:not-allowed; }
        .cea-btn-cancel {
          padding:7px 14px; border-radius:100px; background:transparent; color:var(--mid);
          border:1px solid var(--border); font-family:var(--fb); font-size:12px;
          cursor:pointer; transition:color .2s, border-color .2s;
        }
        .cea-btn-cancel:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .cea-err { font-family:var(--fm); font-size:11px; color:oklch(0.72 0.18 25); }
      `}</style>
      <textarea
        className="cea-textarea"
        value={body}
        onChange={e => setBody(e.target.value)}
        disabled={pending}
        maxLength={MAX_CHARS}
      />
      <div className="cea-row">
        <button type="submit" className="cea-btn-save" disabled={pending || !body.trim()}>
          {pending ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        <button type="button" className="cea-btn-cancel" onClick={onCancel} disabled={pending}>
          Annuler
        </button>
        {error && <span className="cea-err">{error}</span>}
      </div>
    </form>
  )
}

interface DeleteProps {
  id: number
  slug: string
  action: typeof deleteCommentForm
}

export function CommentDeleteButton({ id, slug, action }: DeleteProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('Supprimer ce commentaire ?')) return
    const fd = new FormData()
    fd.set('id', String(id))
    fd.set('slug', slug)
    startTransition(async () => {
      await action(fd)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="cm-btn cm-btn-del"
    >
      {pending ? '…' : 'Supprimer'}
    </button>
  )
}

interface ModerateProps {
  id: number
  labSlug: string
  currentStatus: 'visible' | 'hidden' | 'flagged'
  action: (formData: FormData) => Promise<void>
}

export function CommentModerateButton({ id, labSlug, currentStatus, action }: ModerateProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const nextStatus = currentStatus === 'visible' ? 'hidden' : 'visible'
  const label = currentStatus === 'visible' ? 'Masquer' : 'Restaurer'

  const handleClick = () => {
    const fd = new FormData()
    fd.set('id', String(id))
    fd.set('labSlug', labSlug)
    fd.set('status', nextStatus)
    startTransition(async () => {
      await action(fd)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="cm-btn cm-btn-mod"
    >
      {pending ? '…' : label}
    </button>
  )
}

interface CommentRowActionsProps {
  id: number
  slug: string
  body: string
  isOwn: boolean
  isAdmin: boolean
  status: 'visible' | 'hidden' | 'flagged'
  editAction: typeof editCommentForm
  deleteAction: typeof deleteCommentForm
  moderateAction: (formData: FormData) => Promise<void>
}

export function CommentRowActions({
  id, slug, body, isOwn, isAdmin, status,
  editAction, deleteAction, moderateAction,
}: CommentRowActionsProps) {
  const [editing, setEditing] = useState(false)

  if (!isOwn && !isAdmin) return null

  return (
    <>
      <style>{`
        .cm-actions { display:inline-flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
        .cm-btn {
          padding:4px 12px; border-radius:100px;
          font-family:var(--fm); font-size:10px; letter-spacing:.08em; text-transform:uppercase;
          border:1px solid var(--border); background:transparent; cursor:pointer;
          transition:color .2s, border-color .2s, background .2s;
          color:var(--dim);
        }
        .cm-btn:hover:not(:disabled) { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .cm-btn:disabled { opacity:.45; cursor:not-allowed; }
        .cm-btn-del:hover:not(:disabled) { color:oklch(0.72 0.18 25); border-color:oklch(0.72 0.18 25 / .4); }
        .cm-btn-mod { color:var(--a); border-color:color-mix(in oklab, var(--a) 30%, var(--border)); }
        .cm-btn-mod:hover:not(:disabled) { background:color-mix(in oklab, var(--a) 8%, transparent); border-color:color-mix(in oklab, var(--a) 50%, transparent); }
      `}</style>

      {editing ? (
        <CommentEditForm
          id={id}
          slug={slug}
          initialBody={body}
          onCancel={() => setEditing(false)}
          action={editAction}
        />
      ) : (
        <div className="cm-actions">
          {isOwn && (
            <button type="button" onClick={() => setEditing(true)} className="cm-btn">
              Éditer
            </button>
          )}
          {isOwn && (
            <CommentDeleteButton id={id} slug={slug} action={deleteAction} />
          )}
          {isAdmin && (
            <CommentModerateButton
              id={id}
              labSlug={slug}
              currentStatus={status}
              action={moderateAction}
            />
          )}
        </div>
      )}
    </>
  )
}
