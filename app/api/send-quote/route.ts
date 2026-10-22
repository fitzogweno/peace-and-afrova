import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await req.json()
    
    // Default to English if no language provided
    const lang = body.language || 'EN'
    
    const subject = lang === 'FR' 
      ? `Votre Proposition de Voyage - Réf: ${body.quoteRef}`
      : `Your Travel Proposal - Ref: ${body.quoteRef}`

    const greeting = lang === 'FR' ? `Cher/Chère ${body.clientName},` : `Dear ${body.clientName},`
    const intro = lang === 'FR' 
      ? "Merci d'avoir choisi Peace and Afrova. Veuillez trouver votre proposition de voyage personnalisée prête pour votre examen."
      : "Thank you for choosing Peace and Afrova. Please find your personalised travel proposal ready for your review."
    const cta = lang === 'FR' ? "Voir Votre Proposition" : "View Your Proposal"
    const signoff = lang === 'FR' ? "Cordialement," : "Warm regards,"

    const clientPortalLink = `https://peaceandafrova.com/portal/quote?ref=${body.quoteRef}`

    const { error } = await resend.emails.send({
      from: 'Peace and Afrova <bookings@peaceandafrova.com>',
      to: [body.clientEmail],
      subject: subject,
      html: `
        <div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1B4D3E; font-size: 32px; margin-bottom: 10px; font-weight: normal;">Peace and Afrova</h1>
            <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
            <p style="font-size: 16px; line-height: 1.6;">${greeting}</p>
            <p style="font-size: 16px; line-height: 1.6;">${intro}</p>
            
            <div style="margin: 40px 0; text-align: center;">
              <a href="${clientPortalLink}" style="background-color: #C9A961; color: #1B4D3E; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; display: inline-block;">
                ${cta}
              </a>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #8A8A8A;">
            <p>${signoff}<br/>The Peace and Afrova Team<br/>Curepipe Forest Side, Mauritius</p>
          </div>
        </div>
      `,
    })

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}