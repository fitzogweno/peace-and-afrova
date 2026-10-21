import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Calculate the 50% deposit
    const depositAmount = body.totalAmount * 0.50

    // 2. Create the permanent Booking Record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_ref: body.bookingRef,
        quotation_id: body.quoteId,
        customer_name: body.customerName,
        travel_start: body.travelStart,
        total_amount: body.totalAmount,
        payment_status: 'Pending',
        operations_status: 'Awaiting Suppliers'
      })
      .select()
      .single()

    if (bookingError) {
      console.error("Booking Error:", bookingError)
      throw bookingError
    }

    // 3. Create the Pending Payment Record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        quotation_id: body.quoteId,
        booking_id: booking.id, // Links the payment to the booking!
        amount: depositAmount,
        status: 'Pending',
        payment_type: 'Deposit'
      })

    if (paymentError) {
      console.error("Payment Error:", paymentError)
      throw paymentError
    }

    // 4. Update the original quote status
    await supabase
      .from('quotations')
      .update({ quote_status: 'Accepted' })
      .eq('id', body.quoteId)

    return NextResponse.json({ success: true, depositAmount })
  } catch (error: any) {
    console.error("ACCEPT API ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}