import { NextResponse, after } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdmin } from '../../../../lib/auth-admin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { notifyPartner, siteOrigin } from '../../../../lib/notify'

const DESTINATIONS = ['Mauritius', 'Seychelles', 'Reunion', 'Rodrigues']
const SERVICES = ['Transfer', 'Excursion', 'Accommodation', 'Dining']

// Sends one request to one partner, or the SAME request to several partners at once (a competitive request).
// Competing requests share an rfq_group; accepting one quote closes the others automatically.
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const b = await req.json()
    const partnerIds: string[] = Array.isArray(b.partnerIds) ? [...new Set<string>(b.partnerIds.map(String))] : []
    const pax = Number(b.partySize)
    if (partnerIds.length < 1 || partnerIds.length > 8 || !DESTINATIONS.includes(b.destination) || !SERVICES.includes(b.serviceType) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(b.travelDate || '')) || !Number.isInteger(pax) || pax < 1 || pax > 500 ||
        typeof b.details !== 'string' || !b.details.trim() || b.details.length > 2000) {
      return NextResponse.json({ error: 'Please check the request details' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: partners, error: pErr } = await db.from('partners').select('id, company_name, contact_name, email, phone').in('id', partnerIds).eq('status', 'active')
    if (pErr) throw pErr
    if (!partners || partners.length !== partnerIds.length) {
      return NextResponse.json({ error: 'One or more partners are not active' }, { status: 400 })
    }

    const group = partnerIds.length > 1 ? randomUUID() : null
    const rows = partnerIds.map((id) => ({
      partner_id: id, destination: b.destination, service_type: b.serviceType, travel_date: b.travelDate,
      party_size: pax, details: b.details.trim(), status: 'pending',
      quotation_id: b.quotationId || null, rfq_group: group,
    }))
    const { error } = await db.from('service_requests').insert(rows)
    if (error) throw error

    const link = `${siteOrigin()}/partners/dashboard/requests`
    after(async () => {
      for (const p of partners) {
        await notifyPartner(p, `New service request: ${b.serviceType} in ${b.destination}`, [
          `We have a new ${String(b.serviceType).toLowerCase()} request for ${b.destination} on ${b.travelDate} for ${pax} guests.`,
          `Requirements: ${b.details.trim()}`,
          'Please submit your best net price in your partner portal.',
        ], { label: 'Open Partner Portal', url: link })
      }
    })
    return NextResponse.json({ success: true, count: rows.length, competitive: !!group })
  } catch (error: any) {
    console.error('REQUEST CREATE ERROR:', error)
    return NextResponse.json({ error: 'Could not send the request' }, { status: 500 })
  }
}
