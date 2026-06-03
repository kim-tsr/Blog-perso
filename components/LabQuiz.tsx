'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizQuestion } from '@/lib/labs'

interface Props {
  slug: string
  questions: QuizQuestion[]
  alreadyCompleted: boolean
  onComplete: (formData: FormData) => Promise<void>
  onSubmitAttempt?: (slug: string, score: number, max: number) => Promise<{ ok: boolean; first_try?: boolean; passed?: boolean }>
  previousBest?: { best: number; max: number; attempts: number } | null
  themeColor: string
}

export default function LabQuiz({ slug, questions, alreadyCompleted, onComplete, onSubmitAttempt, previousBest, themeColor }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [revealed, setRevealed] = useState<boolean[]>(() => questions.map(() => false))
  const [done, setDone] = useState(false)
  const [attemptLogged, setAttemptLogged] = useState(false)

  const total = questions.length
  const q = questions[step]
  const chosen = answers[step]
  const isCorrect = chosen !== null && chosen === q.correct
  const correctCount = answers.filter((a, i) => a === questions[i].correct).length
  const pct = Math.round((step / Math.max(total, 1)) * 100)

  const pick = (i: number) => {
    if (revealed[step]) return
    const next = [...answers]; next[step] = i; setAnswers(next)
  }

  const reveal = () => {
    if (chosen === null) return
    const r = [...revealed]; r[step] = true; setRevealed(r)
  }

  const goNext = () => {
    if (step < total - 1) {
      setStep(s => s + 1)
    } else {
      setDone(true)
      if (onSubmitAttempt && !attemptLogged) {
        setAttemptLogged(true)
        const finalScore = answers.filter((a, i) => a === questions[i].correct).length
        onSubmitAttempt(slug, finalScore, total).catch(() => {})
      }
    }
  }

  const allPassed = answers.every((a, i) => a === questions[i].correct)

  const submitCompletion = () => {
    const fd = new FormData()
    fd.set('slug', slug)
    startTransition(async () => {
      await onComplete(fd)
      router.refresh()
    })
  }

  if (alreadyCompleted) {
    return (
      <div className="lq-wrap">
        <style>{`.lq-wrap { max-width:860px; margin:0 auto; padding:0 48px 28px; }
        .lq-done-pill { display:flex; align-items:center; gap:14px; padding:18px 22px; border:1px solid oklch(0.75 0.16 194/.35); background:oklch(0.75 0.16 194/.08); border-radius:14px; }
        .lq-done-tick { width:32px; height:32px; border-radius:50%; background:var(--c); color:#062a30; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; flex-shrink:0; }
        .lq-done-text { font-family:var(--fd); font-size:15px; font-weight:600; color:var(--text); letter-spacing:-.01em; }
        .lq-done-sub { font-family:var(--fm); font-size:11px; color:var(--c); margin-top:3px; letter-spacing:.06em; }
        @media(max-width:768px) { .lq-wrap { padding-left:24px; padding-right:24px; } }`}</style>
        <div className="lq-done-pill">
          <span className="lq-done-tick">✓</span>
          <div>
            <div className="lq-done-text">Quiz validé{previousBest ? ` · ${previousBest.best}/${previousBest.max}` : ''}</div>
            <div className="lq-done-sub">// {previousBest ? `${previousBest.attempts} tentative${previousBest.attempts > 1 ? 's' : ''} enregistrée${previousBest.attempts > 1 ? 's' : ''}` : 'Tu as déjà répondu correctement à toutes les questions'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lq-wrap" style={{ '--lq-col': themeColor } as React.CSSProperties}>
      <style>{`
        .lq-wrap { max-width:860px; margin:0 auto; padding:0 48px 32px; }
        @media(max-width:768px) { .lq-wrap { padding-left:24px; padding-right:24px; } }

        .lq-box { position:relative; padding:30px 32px; border:1px solid var(--border); border-radius:16px; background:linear-gradient(180deg, color-mix(in oklab, var(--lq-col) 5%, transparent), transparent); overflow:hidden; }
        .lq-box::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--lq-col), transparent); }

        .lq-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; flex-wrap:wrap; gap:10px; }
        .lq-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--lq-col); display:flex; align-items:center; gap:8px; }
        .lq-step { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.12em; }

        .lq-progress { display:flex; gap:5px; margin:12px 0 22px; }
        .lq-bar { flex:1; height:4px; border-radius:100px; background:rgba(255,255,255,.06); }
        .lq-bar.done   { background:var(--c); }
        .lq-bar.active { background:linear-gradient(90deg, var(--lq-col), var(--c)); }
        .lq-bar.fail   { background:oklch(0.65 0.20 25 / .6); }

        .lq-q { font-family:var(--fd); font-size:18px; font-weight:600; color:var(--text); line-height:1.4; letter-spacing:-.01em; margin-bottom:20px; }

        .lq-opts { display:flex; flex-direction:column; gap:10px; }
        .lq-opt { display:flex; align-items:center; gap:14px; padding:14px 16px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); cursor:pointer; transition:border-color .2s, background .2s, transform .15s; font-size:14px; color:var(--mid); text-align:left; width:100%; font-family:var(--fb); }
        .lq-opt:hover:not(.disabled) { border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .lq-opt.chosen { border-color:var(--lq-col); background:color-mix(in oklab, var(--lq-col) 8%, transparent); color:var(--text); }
        .lq-opt.correct { border-color:var(--c); background:oklch(0.75 0.16 194/.08); color:var(--text); }
        .lq-opt.wrong   { border-color:oklch(0.65 0.20 25/.5); background:oklch(0.65 0.20 25/.08); color:var(--text); }
        .lq-opt.disabled { cursor:default; }
        .lq-opt-letter { width:24px; height:24px; border-radius:50%; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:var(--fm); font-size:11px; color:var(--dim); flex-shrink:0; transition:border-color .2s, background .2s, color .2s; }
        .lq-opt.chosen .lq-opt-letter   { border-color:var(--lq-col); color:var(--lq-col); background:color-mix(in oklab, var(--lq-col) 10%, transparent); }
        .lq-opt.correct .lq-opt-letter  { border-color:var(--c); background:var(--c); color:#062a30; }
        .lq-opt.wrong .lq-opt-letter    { border-color:oklch(0.65 0.20 25); background:oklch(0.65 0.20 25); color:#fff; }

        .lq-expl { margin-top:18px; padding:14px 16px; border-radius:10px; font-size:13px; line-height:1.6; }
        .lq-expl.ok  { border:1px solid oklch(0.75 0.16 194/.3); background:oklch(0.75 0.16 194/.06); color:var(--mid); }
        .lq-expl.ko  { border:1px solid oklch(0.65 0.20 25/.35); background:oklch(0.65 0.20 25/.06); color:var(--mid); }
        .lq-expl b { color:var(--text); }

        .lq-actions { display:flex; justify-content:space-between; align-items:center; margin-top:20px; gap:10px; flex-wrap:wrap; }
        .lq-action-info { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.06em; }
        .lq-btn { padding:10px 22px; border-radius:100px; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; display:inline-flex; align-items:center; gap:8px; }
        .lq-btn.primary { background:var(--lq-col); color:#fff; }
        .lq-btn.primary:hover:not(:disabled) { transform:translateY(-2px); }
        .lq-btn.success { background:var(--c); color:#062a30; }
        .lq-btn.success:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gc); }
        .lq-btn.ghost { background:transparent; border:1px solid var(--border); color:var(--mid); }
        .lq-btn.ghost:hover { color:var(--text); border-color:rgba(255,255,255,.18); }
        .lq-btn:disabled { opacity:.45; cursor:not-allowed; }

        .lq-final-stat { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:560px) { .lq-final-stat { grid-template-columns:1fr; } }
        .lq-final-cell { padding:14px 16px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); }
        .lq-final-num { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; }
        .lq-final-lab { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.12em; text-transform:uppercase; margin-top:4px; }
        .lq-final-title { font-family:var(--fd); font-size:18px; font-weight:600; color:var(--text); margin-bottom:10px; letter-spacing:-.01em; }
        .lq-final-sub { font-size:13px; color:var(--mid); line-height:1.7; margin-bottom:18px; font-weight:300; }
      `}</style>

      <div className="lq-box">
        <div className="lq-head">
          <div className="lq-label"><span aria-hidden="true">🧠</span>// quiz de validation</div>
          {!done && <div className="lq-step">Question {step + 1} / {total} · {pct}%</div>}
        </div>

        {!done && (
          <>
            <div className="lq-progress">
              {questions.map((_, i) => {
                const status = revealed[i]
                  ? (answers[i] === questions[i].correct ? 'done' : 'fail')
                  : (i === step ? 'active' : '')
                return <div key={i} className={`lq-bar ${status}`} />
              })}
            </div>

            <div className="lq-q">{q.question}</div>

            <div className="lq-opts">
              {q.options.map((opt, i) => {
                let cls = 'lq-opt'
                if (revealed[step]) {
                  cls += ' disabled'
                  if (i === q.correct) cls += ' correct'
                  else if (i === chosen) cls += ' wrong'
                } else if (chosen === i) {
                  cls += ' chosen'
                }
                return (
                  <button type="button" key={i} className={cls} onClick={() => pick(i)}>
                    <span className="lq-opt-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>

            {revealed[step] && (
              <div className={`lq-expl ${isCorrect ? 'ok' : 'ko'}`}>
                <b>{isCorrect ? '✓ Bonne réponse.' : '✗ Pas tout à fait.'}</b>
                {q.explanation && <> {q.explanation}</>}
              </div>
            )}

            <div className="lq-actions">
              <span className="lq-action-info">
                {revealed[step]
                  ? (isCorrect ? 'Continue pour valider la suite.' : 'Lis l\'explication et continue — le quiz se refait si besoin.')
                  : 'Choisis une réponse puis valide.'}
              </span>
              {!revealed[step] ? (
                <button type="button" className="lq-btn primary" disabled={chosen === null} onClick={reveal}>
                  Valider la réponse
                </button>
              ) : (
                <button type="button" className="lq-btn primary" onClick={goNext}>
                  {step < total - 1 ? 'Question suivante' : 'Voir le résultat'}
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </>
        )}

        {done && (
          <>
            <div className="lq-final-stat">
              <div className="lq-final-cell">
                <div className="lq-final-num" style={{ color: allPassed ? 'var(--c)' : 'var(--lq-col)' }}>{correctCount} / {total}</div>
                <div className="lq-final-lab">Bonnes réponses</div>
              </div>
              <div className="lq-final-cell">
                <div className="lq-final-num">{Math.round((correctCount / total) * 100)}%</div>
                <div className="lq-final-lab">Score</div>
              </div>
              <div className="lq-final-cell">
                <div className="lq-final-num" style={{ color: allPassed ? 'var(--c)' : 'oklch(0.78 0.16 25)' }}>{allPassed ? '✓' : '↻'}</div>
                <div className="lq-final-lab">{allPassed ? 'Validé' : 'À reprendre'}</div>
              </div>
            </div>

            <div className="lq-final-title">
              {allPassed ? '🎉 Quiz parfait — lab marqué comme terminé' : 'Presque ! Reprends les questions ratées.'}
            </div>
            <div className="lq-final-sub">
              {allPassed
                ? 'Tu peux passer au lab suivant. Ton score est enregistré dans ton parcours.'
                : 'Le bouton "Marquer terminé" se débloque quand tu as tout bon. Tu peux relire les explications et recommencer.'}
            </div>

            <div className="lq-actions">
              <button type="button" className="lq-btn ghost" onClick={() => { setStep(0); setRevealed(questions.map(() => false)); setDone(false) }}>
                ↻ Recommencer
              </button>
              <button
                type="button"
                className="lq-btn success"
                disabled={!allPassed || pending}
                onClick={submitCompletion}
              >
                {pending ? 'Enregistrement…' : 'Marquer le lab comme terminé'}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M2 5.5L4.5 8l5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
