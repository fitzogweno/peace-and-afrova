import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { bookingId, paymentId } = await req.json()
    
    // We create the client directly here to ensure Next.js doesn't block the update
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Mark the payment as Paid
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'Paid' })
      .eq('booking_id', bookingId)

    if (paymentError) throw paymentError

    // 2. Update the Booking state so it moves to the Operations Desk
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        payment_status: 'Partially Paid',
        operations_status: 'Awaiting Suppliers'
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("CONFIRM PAYMENT ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}