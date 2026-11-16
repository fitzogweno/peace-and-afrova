import { NextResponse, after } from 'next/server'
import { requireAdmin } from '../../../../lib/auth-admin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { makeRef } from '../../../../lib/refs'
import { notifyPartner, siteOrigin } from '../../../../lib/notify'

// Accepts a partner's quotation. The page only tells us WHICH request and quote; everything else is read from the database.
// All database changes happen in ONE transaction (accept_partner_quote in supabase/security-hardening.sql, Section 5):
//   - creates the job on the Dispatch Board, linked to the client's trip when the request was
//   - marks this quote accepted and the other quotes for the request declined
//   - closes competing requests sent to other partners for the same service
// A second click returns the existing job instead of creating a duplicate.
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { requestId, quoteId } = await req.json()
    if (!requestId || !quoteId) return NextResponse.json({ error: 'requestId and quoteId are required' }, { status: 400 })

    const db = supabaseAdmin()
    const { data, error } = await db.rpc('accept_partner_quote', {
      p_request_id: String(requestId), p_quote_id: String(quoteId), p_confirmation: makeRef('JOB'),
    })
    if (error) {
      const msg = error.message || ''
      if (msg.includes('REQUEST_NOT_FOUND') || msg.includes('QUOTE_NOT_FOUND')) return NextResponse.json({ error: 'Request or quotation not found' }, { status: 404 })
      if (msg.includes('REQUEST_CLOSED')) return NextResponse.json({ error: 'This request was closed because another partner was chosen' }, { status: 409 })
      throw error
    }

    const result = data as { alreadyAccepted: boolean; job_id: string | null; confirmation_number?: string; partner_id?: string; closed?: { partner_id: string }[] }
    if (!result.alreadyAccepted) {
      after(async () => {
        const closedIds = (result.closed || []).map((c) => c.partner_id)
        const { data: winner } = await db.from('partners').select('contact_name, company_name, email, phone').eq('id', result.partner_id).maybeSingle()
        const { data: request } = await db.from('service_requests').select('service_type, destination, travel_date').eq('id', requestId).maybeSingle()
        const what = request ? `${request.service_type} in ${request.destination} on ${request.travel_date}` : 'the service'
        if (winner) {
          await notifyPartner(winner, 'Your quotation has been accepted', [
            `Great news: your quotation for ${what} has been accepted.`,
            `Job reference: ${result.confirmation_number}. You can see it under My Bookings in your partner portal.`,
          ], { label: 'Open Partner Portal', url: `${siteOrigin()}/partners/dashboard/bookings` })
        }
        if (closedIds.length) {
          const { data: others } = await db.from('partners').select('contact_name, company_name, email, phone').in('id', closedIds)
          for (const p of others || []) {
            await notifyPartner(p, 'Update on your quotation', [
              `Thank you for quoting for ${what}. On this occasion another partner was selected, so this request is now closed.`,
              'We appreciate your time and look forward to working with you on the next one.',
            ])
          }
        }
      })
    }
    return NextResponse.json({
      success: true, alreadyAccepted: result.alreadyAccepted, jobId: result.job_id,
      confirmationNumber: result.confirmation_number ?? null, closedCompeting: (result.closed || []).length,
    })
  } catch (error: any) {
    console.error('ACCEPT PARTNER QUOTE ERROR:', error)
    return NextResponse.json({ error: 'Could not accept the quotation' }, { status: 500 })
  }
}
