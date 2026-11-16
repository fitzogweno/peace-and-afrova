import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { checkBooking } from '../../../lib/flight-watch'

// Manual "check now" button on the bookings page. The automatic version is /api/cron/flight-watch.
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { flightNumber, bookingRef } = await req.json()
    if (!bookingRef) return NextResponse.json({ error: 'bookingRef required' }, { status: 400 })

    const db = supabaseAdmin()
    const { data: quotation, error } = await db
      .from('quotations')
      .select(`
        id, booking_ref, travel_start,
        enquiries ( id, arrival_flight, flight_status, scheduled_arrival_at, flight_checked_at, customers ( full_name, email ) ),
        supplier_bookings ( id, service_description, pickup_time, original_pickup_time, delay_minutes, driver_name, driver_phone, driver_email, access_token, job_status )
      `)
      .eq('booking_ref', bookingRef)
      .single()
    if (error || !quotation) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const result = await checkBooking(db, quotation, typeof flightNumber === 'string' ? flightNumber : undefined)
    if (!result.ok) return NextResponse.json({ error: result.message || 'Flight check failed' }, { status: 502 })

    return NextResponse.json({
      success: true,
      status: result.status,
      scheduledArrival: result.scheduledAt,
      estimatedArrival: result.estimatedAt,
      actualArrival: result.actualAt,
      delayMinutes: result.delayMinutes,
      newPickupTime: result.newPickupTime,
      action: result.action,
    })
  } catch (error: any) {
    console.error('FLIGHT TRACKING ERROR:', error)
    return NextResponse.json({ error: 'Flight tracking failed' }, { status: 500 })
  }
}
