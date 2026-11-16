import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { esc } from '../../../lib/html'
import { makeRef } from '../../../lib/refs'
import { rateLimit, clientIp } from '../../../lib/rate-limit'
import { verifyTurnstile } from '../../../lib/turnstile'

export async function POST(req: Request) {
  const limited = await rateLimit(req, 'partner-apply', 3, 3600)
  if (limited) return limited
  try {
    const data = await req.json()
    if (!(await verifyTurnstile(data.turnstileToken, clientIp(req)))) {
      return NextResponse.json({ error: 'Verification failed. Please refresh the page and try again.' }, { status: 400 })
    }
    const supabase = supabaseAdmin()
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Server-Side Validation
    if (!data.company_name || !data.email || !data.partner_type) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 })
    }

    // 2. Duplicate Check
    const { data: existing } = await supabase
      .from('partner_applications')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "An application with this email already exists. Our team will contact you soon." }, { status: 400 })
    }

    // 3. Generate Application Reference (e.g., PA-PART-1234)
    const applicationRef = makeRef('PA-PART')

    // 4. Insert into Database
    const { error: insertError } = await supabase
      .from('partner_applications')
      .insert({
        ...Object.fromEntries(
          ['company_name', 'partner_type', 'country', 'website', 'contact_name', 'email', 'country_code', 'phone',
           'destinations', 'services', 'years_in_operation', 'capacity', 'languages', 'introduction', 'agree_terms']
            .filter((k) => k in data)
            .map((k) => [k, data[k]])
        ), // explicit whitelist: callers can no longer write arbitrary columns
        application_reference: applicationRef,
        status: 'pending_review'
      })

    if (insertError) throw insertError

    // 5. Send Email to Admin
    await resend.emails.send({
      from: 'Peace and Afrova <partners@peaceandafrova.com>',
      to: ['hello@peaceandafrova.com'],
      subject: `🤝 New Partner Application: ${data.company_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1B4D3E;">New Partner Application</h2>
          <p><strong>Company:</strong> ${esc(data.company_name)}</p>
          <p><strong>Type:</strong> ${esc(data.partner_type)}</p>
          <p><strong>Contact:</strong> ${esc(data.contact_name)} (${esc(data.email)})</p>
          <p><strong>Reference:</strong> ${esc(applicationRef)}</p>
          <a href="https://peaceandafrova.com/admin/partners" style="display: inline-block; background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px;">Review in Dashboard</a>
        </div>
      `
    })

    return NextResponse.json({ success: true, application_reference: applicationRef })
  } catch (error: any) {
    console.error("PARTNER APPLY ERROR:", error)
    return NextResponse.json({ error: 'Could not submit your application. Please try again.' }, { status: 500 })
  }
}