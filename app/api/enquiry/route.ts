import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // 1. Insert the Customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: body.name,
        email: body.email,
        phone: body.phone,
        country: body.country,
        source: 'website'
      })
      .select()
      .single()

    if (customerError) throw customerError

    // 2. Insert the Enquiry (With Flight & Dietary Data)
    const { error: enquiryError } = await supabase
      .from('enquiries')
      .insert({
        customer_id: customer.id,
        travel_start: body.travel_start,
        party_size: parseInt(body.party_size),
        interests: body.interests,
        has_hotel: body.has_hotel,
        hotel_details: body.hotel_details,
        hotel_budget: body.hotel_budget,
        hotel_location: body.hotel_location,
        hotel_vibe: body.hotel_vibe,
        product_interest: body.product_interest,
        arrival_flight: body.arrival_flight,      // <-- NEW
        departure_flight: body.departure_flight,  // <-- NEW
        dietary_requirements: body.dietary_requirements, // <-- NEW
        status: 'new'
      })

    if (enquiryError) throw enquiryError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('ENQUIRY API ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}