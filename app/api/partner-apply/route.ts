import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Save to database
    const { error } = await supabase
      .from('partners')
      .insert({
        company_name: body.company_name,
        contact_name: body.contact_name,
        email: body.email,
        country_code: body.country_code,
        phone: body.phone,
        partner_type: body.partner_type,
        message: body.message
      })

    if (error) throw error

    // 2. Send Automated "Thank You" Email (Luxury Style)
    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [body.email],
      subject: 'Partnership Request Received - Peace and Afrova',
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
            <p style="font-size: 16px; line-height: 1.6;">Dear ${body.contact_name},</p>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for reaching out to Peace and Afrova Group.</p>
            <p style="font-size: 16px; line-height: 1.6;">We have successfully received your partnership request for <strong>${body.company_name}</strong>. Our B2B team is currently reviewing your details and will be in touch with you shortly.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #FAF7F0; border-left: 4px solid #C9A961;">
              <p style="margin: 0; font-size: 14px; color: #4A4A4A;"><strong>Your Information:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #4A4A4A;">Phone: ${body.country_code || ''} ${body.phone}</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://peaceandafrova.com/experiences" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; display: inline-block;">
                View Our Services
              </a>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #8A8A8A;">
            <p>Warm regards,<br/>The Peace and Afrova Team<br/>Curepipe Forest Side, Mauritius</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Partner API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}