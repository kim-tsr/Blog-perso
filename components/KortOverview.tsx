import { KORT } from '@/lib/kort'

function Architecture() {
  const box = (x: number, y: number, w: number, label: string, sub: string, fill = 'var(--bg)') => (
    <g>
      <rect x={x} y={y} width={w} height={54} fill={fill} stroke="var(--ink)" strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" style={{ font: '600 14px var(--fb)' }} fill="var(--ink)">{label}</text>
      <text x={x + w / 2} y={y + 42} textAnchor="middle" style={{ font: '12px var(--fb)' }} fill="var(--mid)">{sub}</text>
    </g>
  )
  const arrow = (d: string, label: string, lx: number, ly: number) => (
    <g>
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth={1.5} markerEnd="url(#ah)" />
      <text x={lx} y={ly} textAnchor="middle" style={{ font: '600 11px var(--fb)' }} fill="var(--accent)">{label}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 760 330" role="img" aria-label="Architecture de kort : web, api, redis, worker, postgres, cleaner" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink)" /></marker>
      </defs>
      {box(20, 30, 130, 'web', 'nginx · :80')}
      {box(250, 30, 150, 'api', 'FastAPI · :8000', 'var(--hl)')}
      {box(520, 30, 150, 'redis', 'stream "clicks"')}
      {box(520, 140, 150, 'worker', 'N replicas · group')}
      {box(250, 250, 150, 'postgres', 'StatefulSet · :5432')}
      {box(520, 250, 150, 'cleaner', 'CronJob @hourly')}
      {arrow('M150 57H248', '/api/*', 199, 48)}
      {arrow('M400 57H518', 'XADD', 459, 48)}
      {arrow('M595 84V138', 'XREADGROUP', 650, 116)}
      {arrow('M520 167H325V248', 'UPDATE clicks', 440, 160)}
      {arrow('M325 84V248', 'SQL', 305, 170)}
      {arrow('M520 277H402', 'DELETE expirés', 462, 268)}
    </svg>
  )
}

export default function KortOverview() {
  return (
    <>
      <div className="kd-panel"><Architecture /></div>
      <p className="kd-note">L&apos;API ne compte pas les clics : elle publie un événement dans un stream Redis et répond tout de suite. Le worker consomme ce stream en consumer group et agrège dans Postgres. Ce découplage rend chaque composant scalable indépendamment.</p>
      <div className="kd-table-wrap">
        <table className="kd-table">
          <thead><tr><th>Composant</th><th>Rôle</th><th>Écoute</th><th>Objet Kubernetes</th></tr></thead>
          <tbody>{KORT.components.map(c => <tr key={c[0]}>{c.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  )
}
