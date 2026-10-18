import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await req.json()
    
    // Generate a secure, unique link for the client using your live domain
    const clientPortalLink = `https://peaceandafrova.com/portal/quote/${body.quoteRef}`

    const { data, error } = await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [body.clientEmail],
      subject: `Your Travel Proposal - Ref: ${body.quoteRef}`,
      html: `
        <div style="font-family: serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1B4D3E; font-size: 28px; text-align: center;">Peace and Afrova</h1>
          <p style="font-size: 16px;">Dear ${body.clientName},</p>
          <p style="font-size: 16px;">Thank you for choosing Peace and Afrova. Please find your personalised travel proposal ready for your review.</p>
          
          <div style="margin: 40px 0; text-align: center;">
            <a href="${clientPortalLink}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">
              View Your Proposal
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">If you have any questions or would like to request an adjustment, you can do so directly from the proposal page.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5DFD3; font-size: 14px; color: #666; text-align: center;">
            <p>Warm regards,<br/>The Peace and Afrova Team<br/>Curepipe Forest Side, Mauritius</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend Error:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Server Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}