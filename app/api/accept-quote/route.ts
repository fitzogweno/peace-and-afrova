import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { DEPOSIT_RATE, round2 } from '../../../lib/pricing'
import { rateLimit, clientIp } from '../../../lib/rate-limit'

// Client action. Everything that matters (total, dates, name) is read from the database.
// The browser only tells us WHICH quote; it can no longer tell us what it costs.
export async function POST(req: Request) {
  const limited = await rateLimit(req, 'accept-quote', 20, 3600)
  if (limited) return limited
  try {
    const body = await req.json()
    const quoteId = body?.quoteId
    const bookingRef = typeof body?.bookingRef === 'string' ? body.bookingRef.trim() : ''
    if (!quoteId || !bookingRef) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    if (bookingRef.startsWith('DRAFT-')) {
      return NextResponse.json({ error: 'This proposal is still being prepared.' }, { status: 409 })
    }

    const supabase = supabaseAdmin()

    // The quote id and the reference must belong together (the reference acts as the client's key).
    const { data: quote, error: qErr } = await supabase
      .from('quotations')
      .select('id, booking_ref, total, travel_start, quote_status, counter_offer_status, enquiries ( customers ( full_name ) )')
      .eq('id', quoteId)
      .eq('booking_ref', bookingRef)
      .single()
    if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    if (quote.counter_offer_status === 'Pending') {
      return NextResponse.json({ error: 'Your adjustment request is being reviewed. We will be in touch shortly.' }, { status: 409 })
    }

    const total = Number(quote.total)
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'This quote has no valid total.' }, { status: 409 })
    }

    const { data: existing } = await supabase
      .from('bookings')
      .select('id, payment_status, total_amount')
      .eq('quotation_id', quote.id)
      .maybeSingle()

    if (existing) {
      if (existing.payment_status === 'Paid') {
        return NextResponse.json({ error: 'This trip has already been fully paid.' }, { status: 400 })
      }
      return NextResponse.json({ success: true, depositAmount: round2(Number(existing.total_amount ?? total) * DEPOSIT_RATE) })
    }

    const e: any = Array.isArray(quote.enquiries) ? quote.enquiries[0] : quote.enquiries
    const c: any = Array.isArray(e?.customers) ? e.customers[0] : e?.customers
    const customerName = c?.full_name || String(body.customerName || '').slice(0, 120)
    const depositAmount = round2(total * DEPOSIT_RATE)

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_ref: quote.booking_ref,
        quotation_id: quote.id,
        customer_name: customerName,
        travel_start: quote.travel_start,
        total_amount: total,
        payment_status: 'Pending',
        operations_status: 'Awaiting Suppliers',
      })
      .select('id')
      .single()
    if (bookingError) throw bookingError

    const { error: paymentError } = await supabase.from('payments').insert({
      quotation_id: quote.id,
      booking_id: booking.id,
      amount: depositAmount,
      status: 'Pending',
      payment_type: 'Deposit',
    })
    if (paymentError) throw paymentError

    await supabase.from('quotations').update({ quote_status: 'Accepted' }).eq('id', quote.id)
    return NextResponse.json({ success: true, depositAmount })
  } catch (error: any) {
    console.error('ACCEPT API ERROR:', error)
    return NextResponse.json({ error: 'Could not accept the quote. Please contact us.' }, { status: 500 })
  }
}
