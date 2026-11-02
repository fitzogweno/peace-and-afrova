import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Check if a booking already exists for this quotation
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, payment_status')
      .eq('quotation_id', body.quoteId)
      .maybeSingle()

    let depositAmount = body.totalAmount * 0.50

    if (existingBooking) {
      console.log("Booking already exists. Fetching existing deposit...")
      
      // If it's already fully paid, stop them
      if (existingBooking.payment_status === 'Paid') {
        return NextResponse.json({ error: 'This trip has already been fully paid.' }, { status: 400 })
      }

      // If it exists but isn't paid, just let them see the payment instructions again
      return NextResponse.json({ success: true, depositAmount })
    }

    // 2. If no booking exists, create the permanent Booking Record
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

    if (bookingError) throw bookingError

    // 3. Create the Pending Payment Record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        quotation_id: body.quoteId,
        booking_id: booking.id, 
        amount: depositAmount,
        status: 'Pending',
        payment_type: 'Deposit'
      })

    if (paymentError) throw paymentError

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