import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { quotationId, serviceDescription, confirmationNumber, driverName, driverPhone, driverEmail, vehiclePlate, bookingRef, clientEmail, clientName } = await req.json()
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // The Upsert: If a record with this quotation_id and service_description exists, update it.
    // If not, create a new one. This prevents duplicates.
    const { error } = await supabase
      .from('supplier_bookings')
      .upsert(
        {
          quotation_id: quotationId,
          service_description: serviceDescription,
          confirmation_number: confirmationNumber,
          driver_name: driverName,
          driver_phone: driverPhone,
          driver_email: driverEmail,
          vehicle_plate: vehiclePlate,
          supplier_name: 'ATS',
          status: 'Booked'
        },
        { onConflict: 'quotation_id,service_description' }
      )

    if (error) throw error

    // AUTOMATION 1: Trigger "Trip Ready" Email to Client
    if (clientEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-update`, {
        method: 'POST',
        body: JSON.stringify({ bookingRef, clientEmail, clientName, updateType: 'booked' })
      }).catch(err => console.error("Client Email error:", err))
    }

    // AUTOMATION 2: Trigger "Job Assignment" Email to Driver
    if (driverEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-driver-email`, {
        method: 'POST',
        body: JSON.stringify({ driverEmail, driverName, bookingRef })
      }).catch(err => console.error("Driver Email error:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Supplier Booking Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}