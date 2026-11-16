import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { esc } from '../../../lib/html'

// Admin records that the final balance has been received. Previously anyone could call this and mark a trip Paid.
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
    const supabase = supabaseAdmin()

    const { data: existing } = await supabase.from('bookings').select('payment_status').eq('id', bookingId).single()
    if (existing?.payment_status === 'Paid') return NextResponse.json({ success: true, alreadyPaid: true })

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Paid' })
      .eq('id', bookingId)
      .select('booking_ref, quotations ( enquiries ( customers ( full_name, email ) ) )')
      .single()
    if (error || !booking) throw error || new Error('Booking not found')

    const q: any = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations
    const e: any = Array.isArray(q?.enquiries) ? q.enquiries[0] : q?.enquiries
    const c: any = Array.isArray(e?.customers) ? e.customers[0] : e?.customers
    const ref = booking.booking_ref // taken from the database, not from the request body

    if (c?.email) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Peace and Afrova <bookings@peaceandafrova.com>',
        to: [c.email],
        subject: 'Your Trip is Fully Confirmed - Peace and Afrova',
        html: `
          <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
              <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
            </div>
            <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
              <p style="font-size: 16px; line-height: 1.6;">Dear ${esc(c.full_name)},</p>
              <p style="font-size: 16px; line-height: 1.6;">We have received your final balance. Your journey with Peace and Afrova is now fully confirmed.</p>
              <p style="font-size: 16px; line-height: 1.6;">Your full travel itinerary is available in your private portal.</p>
              <div style="margin: 40px 0; text-align: center;">
                <a href="https://peaceandafrova.com/portal/itinerary?ref=${encodeURIComponent(ref)}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; display: inline-block;">View Your Final Itinerary</a>
              </div>
              <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #1B4D3E;">
                <p style="margin: 0; font-size: 14px;"><strong>Your chauffeur will be waiting for you.</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #4A4A4A;">Ten days before arrival, your itinerary unlocks the driver's WhatsApp number and plate number so you can coordinate directly.</p>
              </div>
            </div>
            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #8A8A8A;">
              <p>Warm regards,<br/>The Peace and Afrova Team<br/>Curepipe Forest Side, Mauritius</p>
            </div>
          </div>`,
      })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PAY BALANCE ERROR:', error)
    return NextResponse.json({ error: 'Could not record the balance payment' }, { status: 500 })
  }
}
