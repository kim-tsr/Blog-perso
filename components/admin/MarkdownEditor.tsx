'use client'
import { useState } from 'react'

interface Props {
  name: string
  defaultValue?: string
  rows?: number
  label?: string
}

export default function MarkdownEditor({ name, defaultValue = '', rows = 24, label = 'Contenu (Markdown)' }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  return (
    <div>
      <style>{`
        .mde-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .mde-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .mde-tabs { display:inline-flex; gap:0; border:1px solid var(--border); border-radius:100px; padding:2px; background:rgba(255,255,255,.025); }
        .mde-tab { font-family:var(--fm); font-size:10px; letter-spacing:.08em; padding:5px 12px; border-radius:100px; border:none; background:transparent; color:var(--dim); cursor:pointer; transition:color .2s, background .2s; }
        .mde-tab.active { color:var(--text); background:rgba(255,255,255,.06); }
        .mde-area { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fm); font-size:13px; line-height:1.7; padding:18px 20px; outline:none; transition:border-color .2s; resize:vertical; }
        .mde-area:focus { border-color:var(--v); }
        .mde-preview { background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:18px 22px; min-height:400px; }
        .mde-preview pre { background:var(--bg); border-radius:8px; padding:14px 18px; margin:14px 0; overflow:auto; font-family:var(--fm); font-size:12px; color:var(--c); }
        .mde-preview code { font-family:var(--fm); font-size:13px; color:var(--c); }
        .mde-preview h2 { font-family:var(--fd); font-size:20px; color:var(--text); margin:24px 0 10px; }
        .mde-preview p { color:var(--mid); line-height:1.7; margin:10px 0; font-size:14px; }
      `}</style>
      <div className="mde-head">
        <div className="mde-label">// {label}</div>
        <div className="mde-tabs">
          <button type="button" className={`mde-tab ${tab === 'edit' ? 'active' : ''}`}    onClick={() => setTab('edit')}>edit</button>
          <button type="button" className={`mde-tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')}>preview</button>
        </div>
      </div>
      {tab === 'edit' ? (
        <textarea
          name={name}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={rows}
          className="mde-area"
          placeholder="Écris ton contenu en Markdown : ## titre, **gras**, ```bash blocs de code...```"
        />
      ) : (
        <div className="mde-preview">
          {value.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
            if (line.startsWith('```')) return <pre key={i}><code>{line}</code></pre>
            if (line.trim() === '') return <br key={i} />
            return <p key={i}>{line}</p>
          })}
          {value === '' && <p style={{ color:'var(--dim)' }}>// (preview vide — colle ton markdown dans l&apos;éditeur)</p>}
        </div>
      )}
    </div>
  )
}
