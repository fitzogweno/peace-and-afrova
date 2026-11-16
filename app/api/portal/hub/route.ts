import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser, ownedQuotationId } from '../../../../lib/portal-auth'

export async function GET(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ref = (new URL(req.url).searchParams.get('ref') || '').trim()

  const db = supabaseAdmin()
  const quotationId = await ownedQuotationId(db, user.id, ref)
  if (!quotationId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: quote } = await db
    .from('quotations').select('*, enquiries ( travel_start, customers (full_name) )').eq('id', quotationId).single()
  const { data: booking } = await db.from('bookings').select('*').eq('quotation_id', quotationId).maybeSingle()
  const { data: requests } = await db
    .from('concierge_requests').select('*').eq('booking_ref', ref).order('created_at', { ascending: false })

  return NextResponse.json({ quote, booking, requests: requests || [] }, { headers: { 'Cache-Control': 'no-store' } })
}
