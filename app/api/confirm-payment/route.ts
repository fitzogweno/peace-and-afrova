import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { bookingId, paymentId } = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // 1. Mark the payment as Paid
    await supabase.from('payments').update({ status: 'Paid' }).eq('booking_id', bookingId)

    // 2. Update the Booking state
    const { data: booking } = await supabase.from('bookings').update({ 
      payment_status: 'Partially Paid',
      operations_status: 'Awaiting Suppliers'
    }).eq('id', bookingId).select().single()

    // 3. Update the original Quotation status
    if (booking) {
      await supabase.from('quotations').update({ quote_status: 'Accepted' }).eq('id', booking.quotation_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}