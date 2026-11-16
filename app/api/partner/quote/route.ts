import { NextResponse, after } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser } from '../../../../lib/portal-auth'
import { rateLimit } from '../../../../lib/rate-limit'
import { notifyAdmin } from '../../../../lib/notify'

const CURRENCIES = ['MUR', 'EUR', 'USD', 'GBP']

// A signed-in, active partner submits (or revises) their quotation for a request that was sent to them.
export async function POST(req: Request) {
  const limited = await rateLimit(req, 'partner-quote', 30, 3600)
  if (limited) return limited

  const user = await getPortalUser(req)
  if (!user || !user.confirmed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const b = await req.json()
    const amount = Number(b.netAmount)
    const currency = String(b.currency || 'MUR').toUpperCase()
    const inclusions = typeof b.inclusions === 'string' ? b.inclusions.trim().slice(0, 1000) : ''
    const validUntil = typeof b.validUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.validUntil) ? b.validUntil : null
    if (!b.requestId || !Number.isFinite(amount) || amount <= 0 || amount > 100_000_000 || !CURRENCIES.includes(currency)) {
      return NextResponse.json({ error: 'Please enter a valid price and currency' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: partner } = await db.from('partners').select('id, company_name').ilike('email', user.email).eq('status', 'active').maybeSingle()
    if (!partner) return NextResponse.json({ error: 'Partner account not found' }, { status: 403 })

    // The request must have been sent to THIS partner.
    const { data: request } = await db
      .from('service_requests').select('id, status, service_type, destination, travel_date').eq('id', b.requestId).eq('partner_id', partner.id).maybeSingle()
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    if (!['pending', 'quoted'].includes(request.status)) {
      return NextResponse.json({ error: 'This request is no longer open for quotations' }, { status: 409 })
    }

    const fields = { net_amount: amount, currency, inclusions, valid_until: validUntil, status: 'submitted', submitted_at: new Date().toISOString() }
    const { data: existing } = await db.from('partner_quotations').select('id').eq('service_request_id', request.id).maybeSingle()
    const { error } = existing
      ? await db.from('partner_quotations').update(fields).eq('id', existing.id)
      : await db.from('partner_quotations').insert({ service_request_id: request.id, ...fields })
    if (error) throw error

    await db.from('service_requests').update({ status: 'quoted' }).eq('id', request.id)

    after(() => notifyAdmin(
      `Quotation received from ${partner.company_name}`,
      `${partner.company_name} quoted ${currency} ${amount.toLocaleString()} for ${request.service_type} in ${request.destination} on ${request.travel_date}.\nReview and accept it in Admin > Requests.`
    ))
    return NextResponse.json({ success: true, revised: !!existing })
  } catch (error: any) {
    console.error('PARTNER QUOTE ERROR:', error)
    return NextResponse.json({ error: 'Could not submit your quotation' }, { status: 500 })
  }
}
