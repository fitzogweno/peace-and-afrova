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
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const targetDate = sevenDaysFromNow.toISOString().split('T')[0]

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        booking_ref,
        customer_name,
        total_amount,
        payment_status,
        quotations ( enquiries ( customers ( email ) ) )
      `)
      .eq('travel_start', targetDate)
      .neq('payment_status', 'Paid')

    if (error) throw error

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, message: 'No balance reminders to send today.' })
    }

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
            <p>Dear ${booking.customer_name},</p>
            <p>This is a friendly reminder that the final balance for your upcoming trip (<strong>${booking.booking_ref}</strong>) is due now, as your departure is in 7 days.</p>
            <p>Total Trip Cost: Rs ${booking.total_amount.toLocaleString()}</p>
            <p>Please log in to your private portal to complete the payment and unlock your final travel documents.</p>
            <a href="https://peaceandafrova.com/portal/hub?ref=${booking.booking_ref}" style="display: inline-block; background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px;">Go to Your Portal</a>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, remindersSent: bookings.length })
  } catch (error: any) {
    console.error('BALANCE REMINDER CRON ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}