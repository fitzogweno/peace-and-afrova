import { NextResponse, connection } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { mauritiusToday } from '../../../../lib/service-guarantee'
import { rateLimit } from '../../../../lib/rate-limit'

const DRIVER_UNLOCK_DAYS = 10

export async function GET(req: Request) {
  await connection() // request-time only: never prerender at build (the limiter below catches errors)
  const flood = await rateLimit(req, 'portal-read', 120, 600)
  if (flood) return flood
  const blocked = await rateLimit(req, 'portal-miss', 15, 3600, { peek: true })
  if (blocked) return blocked
  const ref = (new URL(req.url).searchParams.get('ref') || '').trim()
  if (!ref || ref.length > 40 || ref.startsWith('DRAFT-')) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .select(`
      *, service_credit,
      quotations (
        quotation_items ( id, description ),
        supplier_bookings ( id, service_description, confirmation_number, driver_name, vehicle_plate, driver_phone ),
        enquiries ( hotel_details, destination, customers ( full_name ) )
      )
    `)
    .eq('booking_ref', ref)
    .single()
  if (error || !data) {
    await rateLimit(req, 'portal-miss', 15, 3600) // count wrong references per visitor
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Business rule enforced on the server: driver contact details unlock 10 days before arrival.
  // Quote line items are limited to id and description, so net rates and margins never leave the server.
  const today = Date.parse(mauritiusToday() + 'T00:00:00Z')
  const travel = data.travel_start ? Date.parse(String(data.travel_start).slice(0, 10) + 'T00:00:00Z') : NaN
  const daysToGo = Number.isNaN(travel) ? Infinity : Math.round((travel - today) / 86_400_000)
  const unlocked = daysToGo <= DRIVER_UNLOCK_DAYS && daysToGo >= 0

  const q: any = Array.isArray(data.quotations) ? data.quotations[0] : data.quotations
  if (q && !unlocked) {
    q.supplier_bookings = (q.supplier_bookings || []).map((s: any) => ({
      id: s.id, service_description: s.service_description, confirmation_number: s.confirmation_number,
    }))
  }
  return NextResponse.json({ booking: data, driverUnlocked: unlocked }, { headers: { 'Cache-Control': 'no-store' } })
}
