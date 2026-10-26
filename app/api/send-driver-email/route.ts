import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { driverEmail, driverName, bookingRef } = await req.json()
    const resend = new Resend(process.env.RESEND_API_KEY)

    // This link logs them in automatically
    const driverLink = `https://peaceandafrova.com/driver/dashboard?driver=${encodeURIComponent(driverName)}`

    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [driverEmail],
      subject: `New Job Assignment: ${bookingRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1B4D3E;">New Job Assignment</h2>
          <p>Hello ${driverName},</p>
          <p>You have been assigned a new transfer/tour for booking <strong>${bookingRef}</strong>.</p>
          <p>Please click the button below to view the client details, flight number, and hotel pickup location.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${driverLink}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; display: inline-block; border-radius: 4px;">
              View My Job Details
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">If the button doesn't work, copy this link: <br/> ${driverLink}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}