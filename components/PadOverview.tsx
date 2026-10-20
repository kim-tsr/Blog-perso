import Link from 'next/link'
import { PAD_STATS, PAD_ZONES, PAD_DOCS_PAGE } from '@/lib/pad'

export default function PadOverview() {
  return (
    <>
      <style>{`
        .pad-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
        @media (max-width:800px) { .pad-stats { grid-template-columns:repeat(2,1fr); } }
        .pad-stat { border:1px solid var(--border); border-radius:16px; padding:18px 20px; background:color-mix(in srgb, var(--bg) 78%, transparent); }
        .pad-stat b { display:block; font-size:28px; font-weight:700; letter-spacing:-.02em; color:var(--accent); line-height:1.1; margin-bottom:6px; }
        .pad-stat span { font-size:13px; color:var(--mid); line-height:1.5; }
        .pad-off { border:1px solid var(--border); border-left:3px solid var(--accent); border-radius:12px; padding:14px 18px; margin-bottom:24px; color:var(--mid); font-size:15px; line-height:1.7; background:color-mix(in srgb, var(--bg) 78%, transparent); }
        .pad-off a { color:var(--ink); font-weight:600; text-decoration:underline; text-underline-offset:3px; }
      `}</style>
      <p className="pad-off">
        Le lab a été déployé de bout en bout sur mon serveur, puis arrêté : il n&apos;est plus en ligne. La documentation complète reste consultable dans sa <Link href={PAD_DOCS_PAGE}>version archivée</Link>.
      </p>
      <div className="pad-stats">
        {PAD_STATS.map(([n, l]) => <div key={l} className="pad-stat"><b>{n}</b><span>{l}</span></div>)}
      </div>
      <p className="kd-note" style={{ marginTop: 0, marginBottom: 20 }}>
        Un seul hôte Proxmox porte tout. Les services d&apos;infrastructure tournent en LXC, hors du cluster, pour survivre à sa reconstruction ; le cluster Talos héberge la plateforme et les instances de challenges. Un routeur OPNsense découpe le réseau en sept zones.
      </p>
      <div className="kd-table-wrap" style={{ marginTop: 0 }}>
        <table className="kd-table">
          <thead><tr>{PAD_ZONES.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{PAD_ZONES.rows.map(r => <tr key={r[1]}>{r.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  )
}
