import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'

// Admin records that the DEPOSIT has been received (until a payment gateway webhook replaces this).
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { bookingId, paymentId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
    const supabase = supabaseAdmin()

    const { data: booking, error: bErr } = await supabase
      .from('bookings').select('id, quotation_id, payment_status').eq('id', bookingId).single()
    if (bErr || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Idempotent: only a Pending booking moves to Partially Paid.
    if (booking.payment_status !== 'Pending') {
      return NextResponse.json({ success: true, alreadyConfirmed: true })
    }

    // Only the deposit row, never every payment row on the booking.
    let payQuery = supabase.from('payments').update({ status: 'Paid' }).eq('booking_id', bookingId)
    payQuery = paymentId
      ? payQuery.eq('id', paymentId)
      : payQuery.eq('payment_type', 'Deposit').eq('status', 'Pending')
    const { error: pErr } = await payQuery
    if (pErr) throw pErr

    const { error: uErr } = await supabase
      .from('bookings')
      .update({ payment_status: 'Partially Paid', operations_status: 'Awaiting Suppliers' })
      .eq('id', bookingId)
    if (uErr) throw uErr

    await supabase.from('quotations').update({ quote_status: 'Accepted' }).eq('id', booking.quotation_id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('CONFIRM PAYMENT ERROR:', error)
    return NextResponse.json({ error: 'Could not confirm payment' }, { status: 500 })
  }
}
