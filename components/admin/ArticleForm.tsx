'use client'
import { useTransition } from 'react'
import Link from 'next/link'
import MarkdownEditor from './MarkdownEditor'

interface Props {
  categories: { slug: string; label: string }[]
  initial?: {
    id?: string
    slug: string
    title: string
    excerpt: string
    content: string
    category_slug: string
    date_label: string
    read_time: string
    min_role: 'free' | 'pro' | 'admin'
    published: boolean
  }
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>
  onDelete?: () => Promise<void>
  mode: 'create' | 'edit'
}

export default function ArticleForm({ categories, initial, action, onDelete, mode }: Props) {
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await action(fd) })
  }

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        .af-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:700px) { .af-row { grid-template-columns:1fr; } }
        .af-field { display:flex; flex-direction:column; gap:6px; }
        .af-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .af-input, .af-select, .af-textarea { background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 16px; outline:none; transition:border-color .2s, background .2s; }
        .af-input:focus, .af-select:focus, .af-textarea:focus { border-color:var(--v); background:rgba(255,255,255,.06); }
        .af-input::placeholder, .af-textarea::placeholder { color:var(--dim); }
        .af-input.mono { font-family:var(--fm); font-size:13px; letter-spacing:.04em; }
        .af-textarea { resize:vertical; min-height:80px; font-family:var(--fb); line-height:1.6; }
        .af-check { display:inline-flex; align-items:center; gap:10px; cursor:pointer; padding:11px 16px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.04); font-size:13px; color:var(--mid); transition:border-color .2s, background .2s; }
        .af-check:hover { border-color:rgba(255,255,255,.18); }
        .af-check input { appearance:none; width:16px; height:16px; border:1px solid var(--border); border-radius:4px; background:transparent; cursor:pointer; position:relative; transition:background .2s, border-color .2s; }
        .af-check input:checked { background:var(--v); border-color:var(--v); }
        .af-check input:checked::after { content:'✓'; position:absolute; top:-3px; left:2px; color:#fff; font-size:13px; font-weight:700; }
        .af-actions { display:flex; gap:10px; flex-wrap:wrap; justify-content:space-between; align-items:center; padding-top:18px; border-top:1px solid var(--border); }
        .af-cta-group { display:flex; gap:10px; flex-wrap:wrap; }
        .af-btn-save { padding:11px 24px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; }
        .af-btn-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .af-btn-save:disabled { opacity:.55; cursor:not-allowed; }
        .af-btn-cancel { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; transition:color .2s, border-color .2s; }
        .af-btn-cancel:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .af-btn-delete { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid oklch(0.65 0.20 25/.4); color:oklch(0.78 0.16 25); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; transition:border-color .2s, background .2s; }
        .af-btn-delete:hover { border-color:oklch(0.65 0.20 25/.7); background:oklch(0.65 0.20 25/.08); }
      `}</style>

      <div className="af-row">
        <div className="af-field">
          <label className="af-label" htmlFor="title">Titre</label>
          <input id="title" name="title" className="af-input" required defaultValue={initial?.title ?? ''} placeholder="Le titre de l'article" autoFocus />
        </div>
        <div className="af-field">
          <label className="af-label" htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" className="af-input mono" defaultValue={initial?.slug ?? ''} placeholder="auto-généré depuis le titre" />
        </div>
      </div>

      <div className="af-field">
        <label className="af-label" htmlFor="excerpt">Extrait (carte + meta)</label>
        <textarea id="excerpt" name="excerpt" className="af-textarea" defaultValue={initial?.excerpt ?? ''} placeholder="Résumé en une phrase qui apparaît sur les cartes et meta description." />
      </div>

      <div className="af-row">
        <div className="af-field">
          <label className="af-label" htmlFor="category_slug">Catégorie</label>
          <select id="category_slug" name="category_slug" className="af-select" defaultValue={initial?.category_slug ?? 'infra'}>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
        <div className="af-field">
          <label className="af-label" htmlFor="min_role">Accès minimum</label>
          <select id="min_role" name="min_role" className="af-select" defaultValue={initial?.min_role ?? 'free'}>
            <option value="free">Free — accessible à tous</option>
            <option value="pro">Pro — paywall pour les free</option>
            <option value="admin">Admin — visible admins uniquement</option>
          </select>
        </div>
      </div>

      <div className="af-row">
        <div className="af-field">
          <label className="af-label" htmlFor="date_label">Date affichée</label>
          <input id="date_label" name="date_label" className="af-input mono" required defaultValue={initial?.date_label ?? today} placeholder="ex: 15 Avr 2026" />
        </div>
        <div className="af-field">
          <label className="af-label" htmlFor="read_time">Temps de lecture</label>
          <input id="read_time" name="read_time" className="af-input mono" required defaultValue={initial?.read_time ?? '5 min'} placeholder="8 min" />
        </div>
      </div>

      <MarkdownEditor name="content" defaultValue={initial?.content ?? ''} />

      <label className="af-check">
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
        Publier immédiatement (sinon visible uniquement par les admins)
      </label>

      <div className="af-actions">
        <div className="af-cta-group">
          <button type="submit" className="af-btn-save" disabled={pending}>
            {pending ? 'Enregistrement…' : mode === 'create' ? 'Créer l\'article' : 'Enregistrer les modifications'}
          </button>
          <Link href="/admin/articles" className="af-btn-cancel">Annuler</Link>
        </div>
        {onDelete && (
          <button type="button" className="af-btn-delete" onClick={() => {
            if (confirm('Supprimer définitivement cet article ?')) startTransition(() => onDelete())
          }}>
            Supprimer
          </button>
        )}
      </div>
    </form>
  )
}
