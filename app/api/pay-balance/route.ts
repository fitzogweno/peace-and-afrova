import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { bookingId, bookingRef } = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Update the booking to 'Paid'
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ payment_status: 'Paid' })
      .eq('id', bookingId)
      .select(`*, quotations ( enquiries ( customers ( full_name, email ) ) )`)
      .single()

    if (error) throw error

    // 2. Send the Final "Golden Ticket" Email
    const clientEmail = booking.quotations?.enquiries?.customers?.email
    const clientName = booking.quotations?.enquiries?.customers?.full_name

    if (clientEmail) {
      await resend.emails.send({
        from: 'Peace and Afrova <bookings@peaceandafrova.com>',
        to: [clientEmail],
        subject: 'Your Trip is Fully Confirmed - Peace and Afrova',
        html: `
          <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
              <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
            </div>
            
            <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
              <p style="font-size: 16px; line-height: 1.6;">Dear ${clientName},</p>
              <p style="font-size: 16px; line-height: 1.6;">We have received your final balance. Your journey with Peace and Afrova is officially fully confirmed.</p>
              <p style="font-size: 16px; line-height: 1.6;">We have attached your full travel itinerary below. Please keep this document safe.</p>
              
              <div style="margin: 40px 0; text-align: center;">
                <a href="https://peaceandafrova.com/portal/itinerary?ref=${bookingRef}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; display: inline-block;">
                  View Your Final Itinerary
                </a>
              </div>

              <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #1B4D3E;">
                <p style="margin: 0; font-size: 14px;"><strong>Your Chauffeur will be waiting for you.</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #4A4A4A;">10 days before your arrival, your itinerary page will unlock the driver's WhatsApp number and plate number so you can coordinate directly.</p>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #8A8A8A;">
              <p>Warm regards,<br/>The Peace and Afrova Team<br/>Curepipe Forest Side, Mauritius</p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}