import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: body.name,
        email: body.email,
        source: 'website'
      })
      .select()
      .single()

    if (customerError) {
      console.error('CUSTOMER ERROR:', customerError)
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    const { error: enquiryError } = await supabase
      .from('enquiries')
      .insert({
        customer_id: customer.id,
        travel_start: body.travel_start,
        party_size: parseInt(body.party_size),
        interests: body.interests,
        status: 'new'
      })

    if (enquiryError) {
      console.error('ENQUIRY ERROR:', enquiryError)
      return NextResponse.json({ error: enquiryError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SERVER CRASH:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}