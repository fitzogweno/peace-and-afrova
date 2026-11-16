import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin } from '../../../../lib/auth-admin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { esc } from '../../../../lib/html'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { applicationId, action } = await req.json() // action: 'approve' | 'reject'
    if (!applicationId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const { data: application, error: fetchError } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single()
    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Idempotent: a second click must not create a duplicate partner or resend the email.
    if (application.status === 'approved' || application.status === 'rejected') {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    if (action === 'approve') {
      const { error: insertError } = await supabase.from('partners').insert({
        company_name: application.company_name,
        contact_name: application.contact_name,
        email: application.email,
        country_code: application.country_code,
        phone: application.phone,
        partner_type: application.partner_type,
        status: 'active',
      })
      if (insertError) throw insertError

      await supabase
        .from('partner_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)

      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Peace and Afrova <partners@peaceandafrova.com>',
        to: [application.email],
        subject: 'Welcome to the Peace and Afrova Partner Network',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4D3E;">Application Approved</h2>
            <p>Dear ${esc(application.contact_name)},</p>
            <p>We are pleased to welcome <strong>${esc(application.company_name)}</strong> to the Peace and Afrova Partner Network.</p>
            <p>Your application reference <strong>${esc(application.application_reference)}</strong> has been approved.</p>
            <p>In the coming days you will receive a secure invitation link to your Partner Portal, where you can manage your services and availability and receive service requests.</p>
            <br/>
            <p>Best regards,<br/>The Peace and Afrova Team</p>
          </div>`,
      })
    } else {
      await supabase
        .from('partner_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PARTNER APPROVAL ERROR:', error)
    return NextResponse.json({ error: 'Could not process the application' }, { status: 500 })
  }
}
