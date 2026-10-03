// Faisceaux de lumière très discrets, inspirés de Magic UI (Light Rays).
const RAYS = [
  { left: '8%',  rot: -22, w: 140, delay: 0,   dur: 9 },
  { left: '26%', rot: -12, w: 90,  delay: 1.5, dur: 11 },
  { left: '46%', rot: -3,  w: 170, delay: 0.8, dur: 10 },
  { left: '66%', rot: 9,   w: 100, delay: 2.2, dur: 12 },
  { left: '84%', rot: 19,  w: 150, delay: 0.4, dur: 9.5 },
]

export default function LightRays({ height = 620 }: { height?: number }) {
  return (
    <div className="lr" aria-hidden="true" style={{ height }}>
      <style>{`
        .lr { position:absolute; top:0; left:0; right:0; overflow:hidden; pointer-events:none; z-index:0;
          -webkit-mask-image:linear-gradient(to bottom,#000 0%,transparent 100%); mask-image:linear-gradient(to bottom,#000 0%,transparent 100%); }
        .lr i { position:absolute; top:-12%; height:130%; transform-origin:top center; filter:blur(22px);
          background:linear-gradient(to bottom, var(--ray), transparent 78%); animation:lrSway var(--d) ease-in-out var(--dl) infinite alternate; }
        @keyframes lrSway { from { opacity:.35; transform:rotate(calc(var(--r) * 1deg)) } to { opacity:1; transform:rotate(calc(var(--r) * 1deg + 4deg)) } }
      `}</style>
      {RAYS.map((r, i) => (
        <i key={i} style={{ left: r.left, width: r.w, ['--r' as string]: r.rot, ['--d' as string]: `${r.dur}s`, ['--dl' as string]: `${r.delay}s` }} />
      ))}
    </div>
  )
}
