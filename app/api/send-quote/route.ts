import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await req.json()
    
    // LIVE PRODUCTION LINK
    const clientPortalLink = `https://peaceandafrova.com/portal/quote?ref=${body.quoteRef}`

    const { data, error } = await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [body.clientEmail],
      subject: `Your Travel Proposal - Ref: ${body.quoteRef}`,
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
            <p style="font-size: 16px; line-height: 1.6;">Dear ${body.clientName},</p>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing Peace and Afrova. Please find your personalised travel proposal ready for your review.</p>
            
            <div style="margin: 40px 0; text-align: center;">
              <a href="${clientPortalLink}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; display: inline-block;">
                View Your Proposal
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">If you have any questions or would like to request an adjustment, you can do so directly from the proposal page.</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #8A8A8A;">
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