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
    objective: string
    content: string
    category_slug: string
    difficulty: 'débutant' | 'intermédiaire' | 'avancé'
    duration: string
    prerequisites: string[]
    tools: string[]
    min_role: 'free' | 'pro' | 'admin'
    published: boolean
  }
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>
  onDelete?: () => Promise<void>
  mode: 'create' | 'edit'
}

export default function LabForm({ categories, initial, action, onDelete, mode }: Props) {
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await action(fd) })
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        .lf-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .lf-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        @media(max-width:700px) { .lf-row, .lf-row-3 { grid-template-columns:1fr; } }
        .lf-field { display:flex; flex-direction:column; gap:6px; }
        .lf-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .lf-input, .lf-select, .lf-textarea { background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 16px; outline:none; transition:border-color .2s, background .2s; }
        .lf-input:focus, .lf-select:focus, .lf-textarea:focus { border-color:var(--c); background:rgba(255,255,255,.06); }
        .lf-input.mono { font-family:var(--fm); font-size:13px; letter-spacing:.04em; }
        .lf-textarea { resize:vertical; min-height:90px; font-family:var(--fb); line-height:1.55; }
        .lf-textarea.mono { font-family:var(--fm); font-size:13px; line-height:1.7; }
        .lf-help { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:3px; }
        .lf-check { display:inline-flex; align-items:center; gap:10px; cursor:pointer; padding:11px 16px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.04); font-size:13px; color:var(--mid); }
        .lf-check input { appearance:none; width:16px; height:16px; border:1px solid var(--border); border-radius:4px; background:transparent; cursor:pointer; position:relative; transition:background .2s; }
        .lf-check input:checked { background:var(--c); border-color:var(--c); }
        .lf-check input:checked::after { content:'✓'; position:absolute; top:-3px; left:2px; color:#fff; font-size:13px; font-weight:700; }
        .lf-actions { display:flex; gap:10px; justify-content:space-between; align-items:center; padding-top:18px; border-top:1px solid var(--border); flex-wrap:wrap; }
        .lf-cta { display:flex; gap:10px; flex-wrap:wrap; }
        .lf-save { padding:11px 24px; border-radius:100px; background:var(--c); color:#062a30; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; }
        .lf-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gc); }
        .lf-save:disabled { opacity:.55; cursor:not-allowed; }
        .lf-cancel { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; }
        .lf-cancel:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .lf-delete { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid oklch(0.65 0.20 25/.4); color:oklch(0.78 0.16 25); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; }
        .lf-delete:hover { background:oklch(0.65 0.20 25/.08); }
      `}</style>

      <div className="lf-row">
        <div className="lf-field">
          <label className="lf-label" htmlFor="title">Titre</label>
          <input id="title" name="title" className="lf-input" required defaultValue={initial?.title ?? ''} placeholder="Le titre du lab" autoFocus />
        </div>
        <div className="lf-field">
          <label className="lf-label" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" className="lf-input mono" defaultValue={initial?.slug ?? ''} placeholder="auto depuis le titre" />
        </div>
      </div>

      <div className="lf-field">
        <label className="lf-label" htmlFor="objective">Objectif</label>
        <textarea id="objective" name="objective" className="lf-textarea" required defaultValue={initial?.objective ?? ''} placeholder="Ce que l'utilisateur saura faire à la fin du lab." />
      </div>

      <div className="lf-row-3">
        <div className="lf-field">
          <label className="lf-label" htmlFor="category_slug">Catégorie</label>
          <select id="category_slug" name="category_slug" className="lf-select" defaultValue={initial?.category_slug ?? 'infra'}>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
        <div className="lf-field">
          <label className="lf-label" htmlFor="difficulty">Difficulté</label>
          <select id="difficulty" name="difficulty" className="lf-select" defaultValue={initial?.difficulty ?? 'débutant'}>
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
          </select>
        </div>
        <div className="lf-field">
          <label className="lf-label" htmlFor="duration">Durée</label>
          <input id="duration" name="duration" className="lf-input mono" required defaultValue={initial?.duration ?? '20 min'} placeholder="ex: 30 min" />
        </div>
      </div>

      <div className="lf-row">
        <div className="lf-field">
          <label className="lf-label" htmlFor="prerequisites">Prérequis (un par ligne)</label>
          <textarea id="prerequisites" name="prerequisites" className="lf-textarea mono" defaultValue={(initial?.prerequisites ?? []).join('\n')} placeholder={'1 VM Linux\nNotions de bash'} />
          <span className="lf-help">// chaque ligne devient un puce sur la page lab</span>
        </div>
        <div className="lf-field">
          <label className="lf-label" htmlFor="tools">Outils (un par ligne)</label>
          <textarea id="tools" name="tools" className="lf-textarea mono" defaultValue={(initial?.tools ?? []).join('\n')} placeholder={'Docker\nkubectl'} />
        </div>
      </div>

      <div className="lf-field">
        <label className="lf-label" htmlFor="min_role">Accès minimum</label>
        <select id="min_role" name="min_role" className="lf-select" defaultValue={initial?.min_role ?? 'free'}>
          <option value="free">Free — accessible à tous</option>
          <option value="pro">Pro — paywall pour les free</option>
          <option value="admin">Admin — admins uniquement</option>
        </select>
      </div>

      <MarkdownEditor name="content" defaultValue={initial?.content ?? ''} label="Étapes du lab (Markdown)" />

      <label className="lf-check">
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} />
        Publier
      </label>

      <div className="lf-actions">
        <div className="lf-cta">
          <button type="submit" className="lf-save" disabled={pending}>
            {pending ? 'Enregistrement…' : mode === 'create' ? 'Créer le lab' : 'Enregistrer'}
          </button>
          <Link href="/admin/labs" className="lf-cancel">Annuler</Link>
        </div>
        {onDelete && (
          <button type="button" className="lf-delete" onClick={() => {
            if (confirm('Supprimer définitivement ce lab ?')) startTransition(() => onDelete())
          }}>Supprimer</button>
        )}
      </div>
    </form>
  )
}
