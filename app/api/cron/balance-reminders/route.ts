import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { esc } from '../../../../lib/html'
import { BALANCE_DUE_DAYS } from '../../../../lib/pricing'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // "Today" and the departure date are Mauritius dates (UTC+4), not server (UTC) dates.
    const target = new Date(Date.now() + BALANCE_DUE_DAYS * 86_400_000)
    const targetDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Indian/Mauritius' }).format(target)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_ref,
        customer_name,
        total_amount,
        payment_status,
        quotations ( enquiries ( customers ( email ) ) )
      `)
      .eq('travel_start', targetDate)
      .eq('payment_status', 'Partially Paid') // a Pending (unpaid deposit) booking is not owed a balance reminder
      .is('balance_reminder_sent_at', null)   // never send the same reminder twice

    if (error) throw error

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, message: 'No balance reminders to send today.' })
    }

    let sent = 0
    for (const booking of bookings) {
      // FIXED: Safely unwrapping the nested objects to satisfy TypeScript
      const q = booking.quotations as any
      const quotation = Array.isArray(q) ? q[0] : q
      
      const e = quotation?.enquiries as any
      const enquiry = Array.isArray(e) ? e[0] : e
      
      const c = enquiry?.customers as any
      const customer = Array.isArray(c) ? c[0] : c
      
      const customerEmail = customer?.email

      if (!customerEmail) continue

      await resend.emails.send({
        from: 'Peace and Afrova <bookings@peaceandafrova.com>',
        to: [customerEmail],
        subject: `Final Balance Due: Your Trip ${booking.booking_ref} departs in 7 days`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4D3E;">Final Balance Reminder</h2>
            <p>Dear ${esc(booking.customer_name)},</p>
            <p>This is a friendly reminder that the final balance for your upcoming trip (<strong>${esc(booking.booking_ref)}</strong>) is due now, as your departure is in 7 days.</p>
            <p>Total Trip Cost: Rs ${booking.total_amount.toLocaleString()}</p>
            <p>Please log in to your private portal to complete the payment and unlock your final travel documents.</p>
            <a href="https://peaceandafrova.com/portal/hub?ref=${esc(booking.booking_ref)}" style="display: inline-block; background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px;">Go to Your Portal</a>
          </div>
        `,
      })

      const { error: markErr } = await supabase
        .from('bookings')
        .update({ balance_reminder_sent_at: new Date().toISOString() })
        .eq('id', (booking as any).id)
      if (markErr) console.error('Could not record balance reminder:', markErr)
      sent++
    }

    return NextResponse.json({ success: true, remindersSent: sent })
  } catch (error: any) {
    console.error('BALANCE REMINDER CRON ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}