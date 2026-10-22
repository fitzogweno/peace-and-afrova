import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { quotationId, serviceDescription, confirmationNumber, driverName, driverPhone, vehiclePlate, bookingRef, clientEmail, clientName } = await req.json()
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { data: existing } = await supabase
      .from('supplier_bookings')
      .select('id')
      .eq('quotation_id', quotationId)
      .eq('service_description', serviceDescription)
      .maybeSingle()

    if (existing) {
      await supabase.from('supplier_bookings').update({
        confirmation_number: confirmationNumber,
        driver_name: driverName,
        driver_phone: driverPhone,
        vehicle_plate: vehiclePlate,
        status: 'Booked'
      }).eq('id', existing.id)
    } else {
      await supabase.from('supplier_bookings').insert({
        quotation_id: quotationId,
        supplier_name: 'ATS', 
        service_description: serviceDescription,
        confirmation_number: confirmationNumber,
        driver_name: driverName,
        driver_phone: driverPhone,
        vehicle_plate: vehiclePlate,
        status: 'Booked'
      })
    }

    // Trigger the "Trip Ready" Email
    if (clientEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-update`, {
        method: 'POST',
        body: JSON.stringify({ bookingRef, clientEmail, clientName, updateType: 'booked' })
      }).catch(err => console.error("Email error:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}