import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { isUuid } from '../../../../lib/html'

// Driver magic link: the long random token IS the credential. Returns only what the driver needs.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!isUuid(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabaseAdmin()
    .from('supplier_bookings')
    .select(`
      id, service_description, pickup_time, driver_name, vehicle_plate, confirmation_number, job_status,
      quotations (
        bookings ( travel_start, customer_name, car_seats, dietary_needs ),
        enquiries ( arrival_flight, departure_flight, hotel_details )
      )
    `)
    .eq('access_token', token)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ job: data }, { headers: { 'Cache-Control': 'no-store' } })
}
