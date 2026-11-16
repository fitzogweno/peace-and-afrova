import { Resend } from 'resend'
import { sendWhatsAppMessage } from './whatsapp'
import { esc } from './html'

const FROM = 'Peace and Afrova <dispatch@peaceandafrova.com>'
export const siteOrigin = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://peaceandafrova.com'

function shell(body: string) {
  return `<div style="font-family:Georgia,serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;background:#F5F0E6">
    <h2 style="color:#1B4D3E;font-weight:normal;margin:0 0 16px">Peace and Afrova</h2>${body}
    <p style="margin-top:24px;color:#4A4A4A">Warm regards,<br/>The Peace and Afrova Team</p></div>`
}

/** Email (and WhatsApp when configured) to a partner. Never throws: a failed notification must not undo the booking. */
export async function notifyPartner(
  partner: { email?: string | null; phone?: string | null; contact_name?: string | null; company_name?: string | null },
  subject: string, lines: string[], cta?: { label: string; url: string }
) {
  const text = lines.join('\n\n')
  const html = shell(
    `<p>Dear ${esc(partner.contact_name || partner.company_name || 'partner')},</p>` +
    lines.map((l) => `<p>${esc(l)}</p>`).join('') +
    (cta ? `<p style="margin:24px 0"><a href="${esc(cta.url)}" style="background:#C9A961;color:#1B4D3E;padding:12px 24px;text-decoration:none;font-weight:bold">${esc(cta.label)}</a></p>` : '')
  )
  const tasks: Promise<unknown>[] = []
  if (partner.email && process.env.RESEND_API_KEY) {
    tasks.push(new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to: [partner.email], subject, html }))
  }
  if (partner.phone) tasks.push(sendWhatsAppMessage(partner.phone, `${subject}\n\n${text}${cta ? `\n\n${cta.url}` : ''}`))
  const results = await Promise.allSettled(tasks)
  results.forEach((r) => { if (r.status === 'rejected') console.error('Partner notification failed:', r.reason) })
}

export async function notifyAdmin(subject: string, text: string) {
  const tasks: Promise<unknown>[] = []
  const to = process.env.ADMIN_ALERT_EMAIL
  if (to && process.env.RESEND_API_KEY) {
    tasks.push(new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to: [to], subject, html: shell(`<p>${esc(text).replace(/\n/g, '<br/>')}</p>`) }))
  }
  if (process.env.ADMIN_WHATSAPP_NUMBER) tasks.push(sendWhatsAppMessage(process.env.ADMIN_WHATSAPP_NUMBER, `${subject}\n\n${text}`))
  const results = await Promise.allSettled(tasks)
  results.forEach((r) => { if (r.status === 'rejected') console.error('Admin notification failed:', r.reason) })
}
