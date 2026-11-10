import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // 1. Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json({ error: "Missing required contact fields." }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 2. Check if customer exists, if not, create them
    let customerId = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({ full_name: data.name, email: data.email, phone: data.phone, country: data.country })
        .select('id')
        .single()
      
      if (customerError) throw customerError
      customerId = newCustomer.id
    }

    // 3. Insert the Enquiry (and CAPTURE the returned ID for the auto-quote)
    const { data: enquiry, error: enquiryError } = await supabase
      .from('enquiries')
      .insert({
        customer_id: customerId,
        travel_start: data.travel_start,
        party_size: data.party_size,
        destination: data.destination,
        interests: data.interests,
        has_hotel: data.has_hotel,
        hotel_details: data.hotel_details,
        hotel_budget: data.hotel_budget,
        hotel_location: data.hotel_location,
        hotel_vibe: data.hotel_vibe,
        product_interest: data.product_interest
      })
      .select('id')
      .single()

    if (enquiryError) throw enquiryError

    // =====================================================================
    // 🧠 YC INNOVATION: INSTANT AUTO-QUOTE ENGINE
    // =====================================================================
    if (data.draft_estimate_mur && data.draft_nights) {
      try {
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const draftRef = `DRAFT-${new Date().getFullYear()}-${randomNum}`

        // Calculate VAT (15% is included in the estimate, so we reverse-calculate subtotal)
        const total = data.draft_estimate_mur;
        const subtotal = total / 1.15;
        const vat = total - subtotal;

        // Create the Draft Quote
        const { data: draftQuote, error: quoteError } = await supabase
          .from('quotations')
          .insert({
            booking_ref: draftRef,
            enquiry_id: enquiry.id,
            travel_start: data.travel_start,
            subtotal: subtotal,
            vat: vat,
            total: total,
            currency: 'MUR',
            quote_status: 'Draft'
          })
          .select('id')
          .single()

        if (quoteError) throw quoteError

        // Create a baseline line item so the Quote Builder opens cleanly
        if (draftQuote && data.draft_accommodation) {
          const numPax = parseInt(data.party_size.split(' ')[0]) || 2;
          
          await supabase.from('quotation_items').insert({
            quotation_id: draftQuote.id,
            description: `Estimated Accommodation (${data.draft_nights} Nights) - ${data.draft_accommodation}`,
            pax: numPax,
            supplier_cost: (subtotal * 0.6) / numPax, // Rough DMC estimate for cost
            sell_price: subtotal / numPax, // Sell price to match the subtotal
          })
        }
      } catch (autoQuoteError) {
        // If the auto-quote fails, we log it but DO NOT fail the whole enquiry
        console.error("Auto-Quote Generation Failed:", autoQuoteError)
      }
    }
    // =====================================================================

    // 4. Send Email to YOU (Admin Alert)
    try {
      await resend.emails.send({
        from: 'Peace and Afrova <system@peaceandafrova.com>',
        to: ['hello@peaceandafrova.com'],
        subject: `🔔 New Journey Request: ${data.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1B4D3E;">New Bespoke Enquiry</h2>
            <p><strong>Client:</strong> ${data.name} (${data.email})</p>
            <p><strong>Destinations:</strong> ${data.destination}</p>
            <p><strong>Travel Date:</strong> ${data.travel_start}</p>
            <p><strong>Party:</strong> ${data.party_size}</p>
            <div style="background-color: #FAF7F0; padding: 15px; border-left: 4px solid #C9A961; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${data.interests}</p>
            </div>
            <p style="color: #3D8B8B; font-weight: bold;">✨ A Draft Quotation has been automatically generated for this enquiry.</p>
            <a href="https://peaceandafrova.com/admin" style="background-color: #1B4D3E; color: white; padding: 10px 20px; text-decoration: none; display: inline-block;">Open Admin Dashboard</a>
          </div>
        `
      })
    } catch (err) {
      console.error("Admin email failed:", err)
    }

    // 5. Send Auto-Responder to CLIENT
    try {
      await resend.emails.send({
        from: 'Peace and Afrova <hello@peaceandafrova.com>',
        to: [data.email],
        subject: `We have received your journey request, ${data.name.split(' ')[0]}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F5F0E6;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1B4D3E; font-size: 28px; font-weight: normal; margin-bottom: 10px;">Peace & Afrova</h1>
              <div style="width: 50px; height: 1px; background-color: #C9A961; margin: 0 auto;"></div>
            </div>
            
            <div style="background-color: #FFFFFF; padding: 40px; border: 1px solid #E5DFD3;">
              <h2 style="color: #1B4D3E; font-size: 22px; margin-top: 0;">Your journey has begun.</h2>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">Dear ${data.name.split(' ')[0]},</p>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">Thank you for sharing your vision with us. We are delighted that you are considering Peace & Afrova for your Indian Ocean escape.</p>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">Our Journey Designers are currently reviewing your preferences and details. We are meticulously crafting a bespoke proposal tailored to your exact desires.</p>

              <div style="background-color: #FAF7F0; padding: 20px; border-left: 4px solid #C9A961; margin: 30px 0;">
                <p style="margin: 0; color: #4A4A4A; font-size: 14px;"><strong>Your Request Summary:</strong></p>
                <p style="margin: 10px 0 0 0; color: #1A1A1A; font-size: 14px;">
                  Destinations: ${data.destination}<br/>
                  Travel Date: ${data.travel_start}<br/>
                  Party: ${data.party_size}
                </p>
              </div>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">You can expect to hear from us within <strong>24 to 48 hours</strong> with a personalised itinerary and quotation.</p>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">If you have any immediate questions or wish to add further details to your request, simply reply to this email or reach us on WhatsApp.</p>
              
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6; margin-top: 40px;">Warm regards,</p>
              <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;"><strong>Your Journey Designers</strong><br/>Peace & Afrova</p>
            </div>
          </div>
        `
      })
    } catch (err) {
      console.error("Client auto-responder failed:", err)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("ENQUIRY API ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}