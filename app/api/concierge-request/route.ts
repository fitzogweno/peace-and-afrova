import { supabaseAdmin } from '../../../lib/supabase-admin'
import { esc } from '../../../lib/html'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sendWhatsAppMessage } from '../../../lib/whatsapp'
import { rateLimit, clientIp } from '../../../lib/rate-limit'

export async function POST(req: Request) {
  const limited = await rateLimit(req, 'concierge', 10, 3600)
  if (limited) return limited
  try {
    const { bookingRef, customerName, requestType, requestDetails } = await req.json()
    if (typeof bookingRef !== 'string' || !bookingRef || String(customerName || '').length > 120 ||
        String(requestType || '').length > 80 || String(requestDetails || '').length > 2000) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const supabase = supabaseAdmin()
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
          <p><strong>Client:</strong> ${esc(customerName)}</p>
          <p><strong>Booking Ref:</strong> ${esc(bookingRef)}</p>
          <p><strong>Type:</strong> ${esc(requestType)}</p>
          <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #C9A961; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${esc(requestDetails)}"</p>
          </div>
        </div>
      `,
    })

    // 3. Alert Admin via WhatsApp
    const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || ""
    const waMessage = `🌟 *New Concierge Request*\n\nClient: ${customerName}\nRef: ${bookingRef}\nType: ${requestType}\n\nMessage: "${requestDetails}"`
    
    if (adminWhatsApp) await sendWhatsAppMessage(adminWhatsApp, waMessage)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("CONCIERGE REQUEST ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}