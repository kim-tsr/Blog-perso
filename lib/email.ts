/**
 * Envoi d'email simple — pluggable.
 *
 * Si RESEND_API_KEY est défini, utilise Resend.
 * Sinon : no-op silencieux en prod, log console en dev.
 *
 * Pour brancher un autre provider (Brevo, Postmark, SMTP), implémenter
 * un nouveau bloc ici. L'interface publique reste sendEmail().
 */

export interface SendEmailInput {
  to:      string
  subject: string
  html:    string
  text?:   string
  from?:   string
}

const DEFAULT_FROM = process.env.NEWSLETTER_FROM || 'dev.sec.ops <no-reply@dev-sec-ops.dev>'

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = input.from || DEFAULT_FROM

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email:noop] ' + input.to + ' :: ' + input.subject)
      console.log(input.text || input.html)
    }
    return { ok: false, error: 'no_provider_configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from,
        to:      input.to,
        subject: input.subject,
        html:    input.html,
        text:    input.text,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: `resend ${res.status}: ${body}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
