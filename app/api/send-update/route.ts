import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { bookingRef, clientEmail, clientName, updateType } = await req.json()
    const resend = new Resend(process.env.RESEND_API_KEY)

    const subjectMap: Record<string, string> = {
      'booked': 'Your Mauritian Experience is Confirmed',
      'paid': 'Your Trip is Fully Confirmed - Peace and Afrova'
    }

    const messageMap: Record<string, string> = {
      'booked': 'We have confirmed your suppliers and finalized your private arrangements.',
      'paid': 'We have received your final balance. Your journey is officially confirmed.'
    }

    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [clientEmail],
      subject: subjectMap[updateType] || 'Update on your trip',
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
            <p style="font-size: 16px; line-height: 1.6;">Dear ${clientName},</p>
            <p style="font-size: 16px; line-height: 1.6;">${messageMap[updateType] || 'There is an update on your trip.'}</p>
            
            <div style="margin: 40px 0; text-align: center;">
              <a href="https://peaceandafrova.com/portal/quote?ref=${bookingRef}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; display: inline-block;">
                View Your Updated Itinerary
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}