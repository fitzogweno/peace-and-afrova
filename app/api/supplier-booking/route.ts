import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { quotationId, serviceDescription, confirmationNumber } = await req.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if this specific service is already tracked
    const { data: existing } = await supabase
      .from('supplier_bookings')
      .select('id')
      .eq('quotation_id', quotationId)
      .eq('service_description', serviceDescription)
      .single()

    if (existing) {
      // Update existing record
      await supabase.from('supplier_bookings').update({
        confirmation_number: confirmationNumber,
        status: 'Booked'
      }).eq('id', existing.id)
    } else {
      // Insert new record
      await supabase.from('supplier_bookings').insert({
        quotation_id: quotationId,
        service_description: serviceDescription,
        confirmation_number: confirmationNumber,
        status: 'Booked'
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Supplier Booking Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}