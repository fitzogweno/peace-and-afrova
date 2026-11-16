import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser, ownedQuotationId } from '../../../../lib/portal-auth'

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export async function POST(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const db = supabaseAdmin()
  const quotationId = await ownedQuotationId(db, user.id, String(body.ref || ''))
  if (!quotationId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await db.from('bookings').update({
    intake_flight: clip(body.flight, 40),
    dietary_needs: clip(body.dietary, 500),
    special_occasion: clip(body.occasion, 200),
    car_seats: clip(body.carseats, 100),
    pace_preference: clip(body.pace, 100),
    intake_submitted: true,
  }).eq('quotation_id', quotationId)
  if (error) return NextResponse.json({ error: 'Could not save your details' }, { status: 500 })
  return NextResponse.json({ success: true })
}
