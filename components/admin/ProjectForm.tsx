'use client'
import { useTransition } from 'react'
import Link from 'next/link'

interface Props {
  categories: { slug: string; label: string }[]
  initial?: {
    id?: string
    title: string
    description: string
    tags: string[]
    category_slug: string | null
    status: 'live' | 'beta' | 'wip' | 'archive'
    year: string | null
    github_url: string | null
    live_url: string | null
    display_order: number
    published: boolean
    scheduled_for?: string | null
  }
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>
  onDelete?: () => Promise<void>
  mode: 'create' | 'edit'
}

export default function ProjectForm({ categories, initial, action, onDelete, mode }: Props) {
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await action(fd) })
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        .pf-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:700px) { .pf-row { grid-template-columns:1fr; } }
        .pf-field { display:flex; flex-direction:column; gap:6px; }
        .pf-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .pf-input, .pf-select, .pf-textarea { background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 16px; outline:none; transition:border-color .2s; }
        .pf-input:focus, .pf-select:focus, .pf-textarea:focus { border-color:var(--a); background:rgba(255,255,255,.06); }
        .pf-input.mono { font-family:var(--fm); font-size:13px; }
        .pf-textarea { resize:vertical; min-height:90px; line-height:1.55; }
        .pf-check { display:inline-flex; align-items:center; gap:10px; padding:11px 16px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.04); font-size:13px; color:var(--mid); cursor:pointer; }
        .pf-check input { appearance:none; width:16px; height:16px; border:1px solid var(--border); border-radius:4px; cursor:pointer; position:relative; }
        .pf-check input:checked { background:var(--a); border-color:var(--a); }
        .pf-check input:checked::after { content:'✓'; position:absolute; top:-3px; left:2px; color:#2a1b03; font-size:13px; font-weight:700; }
        .pf-actions { display:flex; gap:10px; justify-content:space-between; align-items:center; padding-top:18px; border-top:1px solid var(--border); flex-wrap:wrap; }
        .pf-save { padding:11px 24px; border-radius:100px; background:var(--a); color:#2a1b03; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s; }
        .pf-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--ga); }
        .pf-cancel { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; }
        .pf-cancel:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .pf-delete { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid oklch(0.65 0.20 25/.4); color:oklch(0.78 0.16 25); font-family:var(--fb); font-size:13px; cursor:pointer; }
        .pf-delete:hover { background:oklch(0.65 0.20 25/.08); }
      `}</style>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">Titre</label>
          <input name="title" className="pf-input" required defaultValue={initial?.title ?? ''} autoFocus />
        </div>
        <div className="pf-field">
          <label className="pf-label">Année</label>
          <input name="year" className="pf-input mono" defaultValue={initial?.year ?? new Date().getFullYear().toString()} />
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-label">Description</label>
        <textarea name="description" className="pf-textarea" required defaultValue={initial?.description ?? ''} />
      </div>

      <div className="pf-field">
        <label className="pf-label">Tags (séparés par virgule)</label>
        <input name="tags" className="pf-input mono" defaultValue={(initial?.tags ?? []).join(', ')} placeholder="Go, Kubernetes, eBPF" />
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">Catégorie</label>
          <select name="category_slug" className="pf-select" defaultValue={initial?.category_slug ?? ''}>
            <option value="">— Sans catégorie —</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
        <div className="pf-field">
          <label className="pf-label">Statut</label>
          <select name="status" className="pf-select" defaultValue={initial?.status ?? 'wip'}>
            <option value="live">En production</option>
            <option value="beta">Beta</option>
            <option value="wip">En cours</option>
            <option value="archive">Archive</option>
          </select>
        </div>
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">GitHub URL</label>
          <input name="github_url" className="pf-input mono" type="url" defaultValue={initial?.github_url ?? ''} placeholder="https://github.com/..." />
        </div>
        <div className="pf-field">
          <label className="pf-label">Live URL</label>
          <input name="live_url" className="pf-input mono" type="url" defaultValue={initial?.live_url ?? ''} placeholder="https://..." />
        </div>
      </div>

      <div className="pf-field" style={{ maxWidth:200 }}>
        <label className="pf-label">Ordre d&apos;affichage</label>
        <input name="display_order" className="pf-input mono" type="number" defaultValue={initial?.display_order ?? 0} />
      </div>

      <div className="pf-row">
        <label className="pf-check">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
          Publier maintenant
        </label>
        <div className="pf-field">
          <label className="pf-label" htmlFor="scheduled_for">Publier le · (optionnel)</label>
          <input
            id="scheduled_for"
            name="scheduled_for"
            type="datetime-local"
            className="pf-input mono"
            defaultValue={initial?.scheduled_for ? new Date(initial.scheduled_for).toISOString().slice(0, 16) : ''}
          />
        </div>
      </div>

      <div className="pf-actions">
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button type="submit" className="pf-save" disabled={pending}>{pending ? '…' : mode === 'create' ? 'Créer le projet' : 'Enregistrer'}</button>
          <Link href="/admin/projects" className="pf-cancel">Annuler</Link>
        </div>
        {onDelete && (
          <button type="button" className="pf-delete" onClick={() => {
            if (confirm('Supprimer ce projet ?')) startTransition(() => onDelete())
          }}>Supprimer</button>
        )}
      </div>
    </form>
  )
}
