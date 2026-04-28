export default function Footer() {
  return (
    <footer style={{
      borderTop:'1px solid var(--border)', padding:'28px 48px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background:'var(--bg)',
    }}>
      <style>{`
        .fl { font-family:var(--fd); font-size:14px; font-weight:700; letter-spacing:-.01em; }
        .fl b { color:var(--v); }
        .fc { font-family:var(--fm); font-size:11px; color:var(--dim); }
        @media(max-width:768px) { footer { flex-direction:column; gap:8px; text-align:center; padding:24px; } }
      `}</style>
      <span className="fl">dev.<b>sec</b>.ops</span>
      <span className="fc">© 2026 — Fait avec rigueur &amp; curiosité</span>
    </footer>
  )
}
