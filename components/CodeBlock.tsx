import type { Snippet } from '@/lib/kort'

export default function CodeBlock({ file, lang, code }: Snippet) {
  return (
    <figure className="cb">
      <figcaption><span className="cb-dots"><i /><i /><i /></span><span className="cb-file">{file}</span><span>{lang}</span></figcaption>
      <pre><code>{code}</code></pre>
    </figure>
  )
}

export const CODE_CSS = `
  .cb { margin:16px 0 0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:#0b1220; color:#e2e8f0; box-shadow:0 12px 34px rgba(0,0,0,.14); }
  .cb figcaption { display:flex; align-items:center; gap:12px; padding:10px 16px; font-family:var(--fm); font-size:12px; background:#131c2e; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.06); }
  .cb-dots { display:flex; gap:6px; } .cb-dots i { width:10px; height:10px; border-radius:50%; background:#334155; }
  .cb-dots i:nth-child(1){ background:#ef6b6b; } .cb-dots i:nth-child(2){ background:#e8b94a; } .cb-dots i:nth-child(3){ background:#5ac47a; }
  .cb-file { flex:1; color:#cbd5e1; }
  .cb pre { padding:18px 20px; overflow-x:auto; font-family:var(--fm); font-size:12.5px; line-height:1.75; tab-size:2; }
`
