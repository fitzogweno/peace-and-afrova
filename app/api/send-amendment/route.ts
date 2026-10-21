import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: ['hello@peaceandafrova.com'], // YOUR EMAIL
      subject: `⚠️ Amendment Request: ${body.quoteRef}`,
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 28px; margin-bottom: 10px; font-weight: normal;">Amendment Request</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
            <p style="font-size: 16px; line-height: 1.6;">Client <strong>${body.clientName}</strong> has requested changes to Quote <strong>${body.quoteRef}</strong>.</p>
            
            <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #C9A961; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Client's Message:</strong></p>
              <p style="margin: 0; font-style: italic; color: #4A4A4A;">"${body.message}"</p>
              
              <p style="margin: 20px 0 0 0;"><strong>Requested Price:</strong> ${body.requestedPercent}% of original total</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://peaceandafrova.com/admin" style="background-color: #1B4D3E; color: #FFFFFF; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; display: inline-block;">
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Amendment Email Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}