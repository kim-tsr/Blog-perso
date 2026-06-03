'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { submitCommentForm } from '@/lib/comments'

const MAX_CHARS = 4000

const ERR_LABEL: Record<string, string> = {
  missing_fields:       'Champs manquants.',
  empty_body:           'Le commentaire est vide.',
  body_too_long:        `Maximum ${MAX_CHARS} caractères.`,
  rate_limited:         'Tu postes trop vite. Attends 30 secondes.',
  not_authenticated:    'Tu dois être connecté·e.',
  no_db:                'Service indisponible.',
  unknown:              'Erreur inconnue. Réessaie.',
}

interface Props {
  slug: string
  action: typeof submitCommentForm
  placeholder?: string
}

export default function CommentForm({ slug, action, placeholder = 'Laisse un commentaire…' }: Props) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const remaining = MAX_CHARS - body.length
  const overLimit = remaining < 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || overLimit || pending) return
    setError(null)

    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('body', body)

    startTransition(async () => {
      const result = await action(fd)
      if (!result.ok) {
        setError(ERR_LABEL[result.error ?? 'unknown'] ?? ERR_LABEL.unknown)
        return
      }
      setBody('')
      if (textareaRef.current) textareaRef.current.value = ''
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="cf-form">
      <style>{`
        .cf-form { display:flex; flex-direction:column; gap:10px; }
        .cf-textarea-wrap { position:relative; }
        .cf-textarea {
          width:100%; min-height:100px; padding:14px 16px; padding-bottom:32px;
          border:1px solid var(--border); border-radius:12px;
          background:rgba(255,255,255,.025); color:var(--text);
          font-family:var(--fb); font-size:14px; line-height:1.6;
          resize:vertical; outline:none;
          transition:border-color .2s, background .2s;
          box-sizing:border-box;
        }
        .cf-textarea:focus { border-color:var(--v); background:rgba(255,255,255,.04); }
        .cf-textarea:disabled { opacity:.55; cursor:not-allowed; }
        .cf-counter {
          position:absolute; bottom:10px; right:14px;
          font-family:var(--fm); font-size:10px; letter-spacing:.06em;
          color:var(--dim); pointer-events:none;
          transition:color .2s;
        }
        .cf-counter.over { color:oklch(0.72 0.18 25); }
        .cf-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .cf-submit {
          padding:10px 22px; border-radius:100px;
          background:var(--v); color:#fff; border:none;
          font-family:var(--fb); font-size:13px; font-weight:600;
          cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s;
          display:inline-flex; align-items:center; gap:8px;
        }
        .cf-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px oklch(0.68 0.24 280/.3); }
        .cf-submit:disabled { opacity:.55; cursor:not-allowed; }
        .cf-error { font-family:var(--fm); font-size:11.5px; color:oklch(0.72 0.18 25); letter-spacing:.04em; }
      `}</style>

      <div className="cf-textarea-wrap">
        <textarea
          ref={textareaRef}
          className="cf-textarea"
          placeholder={placeholder}
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={pending}
          aria-label="Votre commentaire"
          maxLength={MAX_CHARS + 1}
        />
        <span className={`cf-counter${overLimit ? ' over' : ''}`}>
          {remaining < 200 ? `${remaining}` : `${body.length}/${MAX_CHARS}`}
        </span>
      </div>

      <div className="cf-row">
        <button type="submit" className="cf-submit" disabled={pending || !body.trim() || overLimit}>
          {pending ? 'Envoi…' : 'Publier'}
          {!pending && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        {error && <span className="cf-error">{error}</span>}
      </div>
    </form>
  )
}
