import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const applicationRef = `PA-PART-${randomNum}`

    // 4. Insert into Database
    const { error: insertError } = await supabase
      .from('partner_applications')
      .insert({
        ...data,
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
          <p><strong>Company:</strong> ${data.company_name}</p>
          <p><strong>Type:</strong> ${data.partner_type}</p>
          <p><strong>Contact:</strong> ${data.contact_name} (${data.email})</p>
          <p><strong>Reference:</strong> ${applicationRef}</p>
          <a href="https://peaceandafrova.com/admin/partners" style="display: inline-block; background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px;">Review in Dashboard</a>
        </div>
      `
    })

    return NextResponse.json({ success: true, application_reference: applicationRef })
  } catch (error: any) {
    console.error("PARTNER APPLY ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}