import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const cutoffTime = oneDayAgo.toISOString()

    const { data: quotes, error } = await supabase
      .from('quotations')
      .select(`
        booking_ref,
        total,
        created_at,
        enquiries ( customers ( full_name, email ) )
      `)
      .eq('quote_status', 'Draft')
      .lt('created_at', cutoffTime)

    if (error) throw error

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ success: true, message: 'No abandoned quotes to recover today.' })
    }

    for (const quote of quotes) {
      // FIXED: Safely extracting data from nested arrays
      const enquiry = Array.isArray(quote.enquiries) ? quote.enquiries[0] : quote.enquiries;
      const customer = Array.isArray(enquiry?.customers) ? enquiry.customers[0] : enquiry?.customers;

      if (!customer?.email) continue

      await resend.emails.send({
        from: 'Peace and Afrova <bookings@peaceandafrova.com>',
        to: [customer.email],
        subject: `Your private travel quote for ${quote.booking_ref} is still available`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4D3E;">Your Private Proposal is Still Waiting</h2>
            <p>Dear ${customer.full_name},</p>
            <p>We noticed you haven't had a chance to review your personalized travel proposal for <strong>${quote.booking_ref}</strong>.</p>
            <p>Your private quote is still available, but please note that prices and availability are subject to change. We would love to help you secure your journey.</p>
            <a href="https://peaceandafrova.com/portal/quote?ref=${quote.booking_ref}" style="display: inline-block; background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px;">Review Your Quote</a>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">If you have any questions, simply reply to this email.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, recoveryEmailsSent: quotes.length })
  } catch (error: any) {
    console.error('ABANDONED QUOTE CRON ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}