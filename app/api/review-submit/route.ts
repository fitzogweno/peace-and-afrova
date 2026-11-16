import { esc, isEmail } from '../../../lib/html'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, clientIp } from '../../../lib/rate-limit'
import { verifyTurnstile } from '../../../lib/turnstile'

export async function POST(req: Request) {
  const limited = await rateLimit(req, 'review', 3, 3600)
  if (limited) return limited
  try {
    const body = await req.json()
    if (!(await verifyTurnstile(body.turnstileToken, clientIp(req)))) {
      return NextResponse.json({ error: 'Verification failed. Please refresh the page and try again.' }, { status: 400 })
    }
    const rating = Number(body.rating)
    if (!isEmail(body.email) || !Number.isInteger(rating) || rating < 1 || rating > 5 ||
        String(body.client_name || '').length > 120 || String(body.review_text || '').length > 3000) {
      return NextResponse.json({ error: 'Invalid review' }, { status: 400 })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const supabase = supabaseAdmin()

    // 1. Save review
    const { error } = await supabase.from('reviews').insert({
      client_name: body.client_name,
      email: body.email,
      review_text: body.review_text,
      rating: body.rating
    })

    if (error) throw error

    // 2. Send "Thank You for Reviewing" Email with Products Link
    await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [body.email],
      subject: 'Thank you for your review - Peace and Afrova',
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3; text-align: center;">
            <h2 style="color: #1B4D3E; font-weight: normal; margin-bottom: 20px;">Thank you for your feedback</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Dear ${esc(body.client_name)},</p>
            <p style="font-size: 16px; line-height: 1.6;">We are thrilled to hear about your experience with us. Thank you for taking the time to share your review.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">As a token of our appreciation, we have also subscribed you to our exclusive newsletter. To discover more of what Mauritius has to offer, explore our curated experiences below.</p>

            <div style="margin-top: 40px;">
              <a href="https://peaceandafrova.com/experiences" style="background-color: #1B4D3E; color: #F5F0E6; padding: 16px 32px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; display: inline-block;">
                View Our Experiences
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
    console.error("Review API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}