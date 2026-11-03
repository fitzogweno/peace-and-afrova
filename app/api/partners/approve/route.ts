import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { applicationId, action } = await req.json() // action: 'approve' | 'reject'
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Fetch the application
    const { data: application, error: fetchError } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) throw new Error("Application not found")

    if (action === 'approve') {
      // 2. Move to official partners table
      const { error: insertError } = await supabase
        .from('partners')
        .insert({
          company_name: application.company_name,
          contact_name: application.contact_name,
          email: application.email,
          country_code: application.country_code,
          phone: application.phone,
          partner_type: application.partner_type,
          status: 'active'
        })

      if (insertError) throw insertError

      // 3. Update application status
      await supabase
        .from('partner_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)

      // 4. Send Welcome / Onboarding Email
      await resend.emails.send({
        from: 'Peace and Afrova <partners@peaceandafrova.com>',
        to: [application.email],
        subject: `Welcome to the Peace and Afrova Partner Network`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4D3E;">Application Approved!</h2>
            <p>Dear ${application.contact_name},</p>
            <p>We are thrilled to welcome <strong>${application.company_name}</strong> to the Peace and Afrova Partner Network.</p>
            <p>Your application reference <strong>${application.application_reference}</strong> has been officially approved.</p>
            <p>In the coming days, you will receive a secure invitation link to access your Partner Portal, where you can manage your services, availability, and receive service requests.</p>
            <br/>
            <p>Best regards,<br/>The Peace and Afrova Team</p>
          </div>
        `
      })

    } else {
      // Reject
      await supabase
        .from('partner_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("PARTNER APPROVAL ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}