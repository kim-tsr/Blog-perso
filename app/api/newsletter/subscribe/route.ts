import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { SITE_URL, SITE_NAME } from '@/lib/site'

interface Body {
  email?:       string
  source_page?: string
}

function confirmHtml(url: string): string {
  return `
<!DOCTYPE html>
<html><body style="background:#07070c;color:#e6e6f0;font-family:-apple-system,sans-serif;padding:32px;">
  <div style="max-width:540px;margin:0 auto;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:32px;">
    <h1 style="margin:0 0 18px;font-size:22px;color:#fff;">Confirme ton inscription</h1>
    <p style="line-height:1.6;color:#b0b0c0;font-size:14px;">
      Tu reçois cet email parce qu'une inscription à la newsletter <b>${SITE_NAME}</b> a été initiée avec cette adresse.
    </p>
    <p style="margin:24px 0;text-align:center;">
      <a href="${url}" style="display:inline-block;background:#a371ef;color:#fff;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:600;">
        Confirmer mon inscription
      </a>
    </p>
    <p style="line-height:1.6;color:#80808c;font-size:12px;">
      Si tu n'es pas à l'origine de cette demande, ignore simplement cet email — aucun compte ne sera créé.
    </p>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />
    <p style="color:#60606c;font-size:11px;line-height:1.5;">
      ${SITE_NAME} — DevSecOps, infrastructure, sécurité réseau. Tutoriels FR par Kim Tessier.
    </p>
  </div>
</body></html>
  `
}

export async function POST(req: NextRequest) {
  let body: Body
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 }) }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: false, error: 'no_db' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('newsletter_subscribe', {
    p_email: email,
    p_source_page: body.source_page ?? null,
  })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const result = (data ?? {}) as { ok: boolean; state?: string; token?: string; error?: string }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? 'unknown' }, { status: 400 })
  }

  if (result.state === 'already_confirmed') {
    return NextResponse.json({ ok: true, state: 'already_confirmed' })
  }

  if (result.token) {
    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${result.token}`
    await sendEmail({
      to:      email,
      subject: `Confirme ton inscription à ${SITE_NAME}`,
      html:    confirmHtml(confirmUrl),
      text:    `Confirme ton inscription : ${confirmUrl}`,
    })
  }

  return NextResponse.json({ ok: true, state: 'pending' })
}
