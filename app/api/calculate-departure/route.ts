import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { flightNumber, bookingRef } = await req.json()
    const apiKey = process.env.AERODATABOX_API_KEY
    if (!apiKey) throw new Error("AERODATABOX_API_KEY is not set.")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // 1. Find the enquiry to get the travel date
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select(`id, travel_start, enquiries ( id )`)
      .eq('booking_ref', bookingRef)
      .single()

    if (quoteError || !quotation) throw new Error("Booking not found.")
    const travelDate = quotation.travel_start
    
    // @ts-ignore
    const enquiryId = Array.isArray(quotation.enquiries) ? quotation.enquiries[0]?.id : quotation.enquiries?.id;

    // 2. Fetch departure flight data
    const apiHost = 'aerodatabox.p.rapidapi.com'
    const apiUrl = `https://${apiHost}/flights/number/${flightNumber}/${travelDate}?withAircraftImage=false&withLocation=false`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    })

    if (!response.ok) {
        throw new Error(`AeroDataBox API error: ${response.status}`);
    }
    
    const flightData = await response.json()
    if (!flightData || flightData.length === 0) throw new Error("No flight data found.");
    
    const flight = flightData[0];
    const departureScheduledTime = flight.departure.scheduledTime.local; // e.g., "2026-10-31 15:30+04:00"

    // 3. Swiss Precision Math
    const flightDate = new Date(departureScheduledTime)
    
    // Subtract 3 hours for international check-in
    flightDate.setHours(flightDate.getHours() - 3)
    
    // Subtract 1.5 hours for the drive from hotel to airport
    flightDate.setMinutes(flightDate.getMinutes() - 90)

    // Format as "HH:MM"
    const pickupTime = flightDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    // 4. Save to database
    const { error: updateError } = await supabase
      .from('enquiries')
      .update({
        departure_time: new Date(departureScheduledTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        calculated_pickup_time: pickupTime
      })
      .eq('id', enquiryId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      departureTime: flight.departure.scheduledTime.local,
      calculatedPickupTime: pickupTime
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}