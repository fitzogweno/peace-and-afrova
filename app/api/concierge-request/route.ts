import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { bookingRef, customerName, requestType, requestDetails } = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Save to Database
    const { error } = await supabase.from('concierge_requests').insert({
      booking_ref: bookingRef,
      customer_name: customerName,
      request_type: requestType,
      request_details: requestDetails
    })

    if (error) throw error

    // 2. Alert Admin via Email
    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: ['hello@peaceandafrova.com'],
      subject: `🌟 Concierge Request from ${customerName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1B4D3E;">New Concierge Request</h2>
          <p><strong>Client:</strong> ${customerName}</p>
          <p><strong>Booking Ref:</strong> ${bookingRef}</p>
          <p><strong>Type:</strong> ${requestType}</p>
          <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #C9A961; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${requestDetails}"</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}