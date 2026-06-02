'use client'
import { useTransition } from 'react'
import Link from 'next/link'

interface Props {
  initial?: {
    slug: string
    label: string
    description: string
    theme: 'violet' | 'cyan' | 'amber'
    display_order: number
  }
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>
  onDelete?: () => Promise<void>
  mode: 'create' | 'edit'
}

const THEMES = [
  { value: 'violet', label: 'Violet (Infrastructure)', color: 'var(--v)' },
  { value: 'cyan',   label: 'Cyan (Sécurité)',         color: 'var(--c)' },
  { value: 'amber',  label: 'Ambre (Réseau)',          color: 'var(--a)' },
]

export default function CategoryForm({ initial, action, onDelete, mode }: Props) {
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => { await action(fd) })
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        .cf-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:700px) { .cf-row { grid-template-columns:1fr; } }
        .cf-field { display:flex; flex-direction:column; gap:6px; }
        .cf-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .cf-input, .cf-select, .cf-textarea { background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 16px; outline:none; transition:border-color .2s; }
        .cf-input:focus, .cf-select:focus, .cf-textarea:focus { border-color:var(--v); }
        .cf-input.mono { font-family:var(--fm); font-size:13px; }
        .cf-input.locked { color:var(--dim); background:rgba(255,255,255,.02); }
        .cf-textarea { resize:vertical; min-height:80px; }
        .cf-help { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:3px; }
        .cf-actions { display:flex; justify-content:space-between; align-items:center; padding-top:18px; border-top:1px solid var(--border); flex-wrap:wrap; gap:10px; }
        .cf-save { padding:11px 24px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease); }
        .cf-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .cf-cancel { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid var(--border); color:var(--mid); font-size:13px; }
        .cf-delete { padding:11px 22px; border-radius:100px; background:transparent; border:1px solid oklch(0.65 0.20 25/.4); color:oklch(0.78 0.16 25); font-size:13px; cursor:pointer; }
      `}</style>

      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Label</label>
          <input name="label" className="cf-input" required defaultValue={initial?.label ?? ''} placeholder="ex: Cloud Native" autoFocus />
        </div>
        <div className="cf-field">
          <label className="cf-label">Slug (URL)</label>
          <input
            name="slug"
            className={`cf-input mono ${mode === 'edit' ? 'locked' : ''}`}
            defaultValue={initial?.slug ?? ''}
            placeholder="auto depuis le label"
            readOnly={mode === 'edit'}
          />
          {mode === 'edit' && <span className="cf-help">// le slug est verrouillé pour préserver les URLs existantes</span>}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">Description</label>
        <textarea name="description" className="cf-textarea" defaultValue={initial?.description ?? ''} placeholder="Phrase de présentation de la catégorie." />
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Thème visuel</label>
          <select name="theme" className="cf-select" defaultValue={initial?.theme ?? 'violet'}>
            {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="cf-field">
          <label className="cf-label">Ordre d&apos;affichage</label>
          <input name="display_order" className="cf-input mono" type="number" defaultValue={initial?.display_order ?? 0} />
        </div>
      </div>

      <div className="cf-actions">
        <div style={{ display:'flex', gap:10 }}>
          <button type="submit" className="cf-save" disabled={pending}>{pending ? '…' : mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
          <Link href="/admin/categories" className="cf-cancel">Annuler</Link>
        </div>
        {onDelete && (
          <button type="button" className="cf-delete" onClick={() => {
            if (confirm('Supprimer cette catégorie ? Les articles liés perdent leur association.')) startTransition(() => onDelete())
          }}>Supprimer</button>
        )}
      </div>
    </form>
  )
}
