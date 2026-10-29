import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { flightNumber, bookingRef } = await req.json()
    const apiKey = process.env.AERODATABOX_API_KEY
    if (!apiKey) throw new Error("AERODATABOX_API_KEY is not set.")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // 1. Find the enquiry related to this booking to get the travel date
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select(`id, travel_start, enquiries ( id, arrival_flight )`)
      .eq('booking_ref', bookingRef)
      .single()

    if (quoteError || !quotation) throw new Error("Booking not found.")

    const travelDate = quotation.travel_start
    
    // 2. Fetch flight data from AeroDataBox
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
        const errorText = await response.text();
        throw new Error(`AeroDataBox API error: ${response.status} ${errorText}`);
    }
    
    const flightData = await response.json()

    // The API returns an array of flights, we take the first one.
    if (!flightData || flightData.length === 0) {
      throw new Error("No flight data found for this number and date.");
    }
    const flight = flightData[0];

    // 3. Extract the relevant information
    const arrivalInfo = flight.arrival;
    const flightStatus = flight.status; // e.g., "Arrived", "Delayed", "Scheduled"
    const scheduledTime = arrivalInfo.scheduledTime.local;
    const estimatedTime = arrivalInfo.revisedTime?.local || scheduledTime;
    const actualTime = arrivalInfo.actualTime?.local;

    // FIX: Safely extract the ID whether it's an array or object
    // @ts-ignore
    const enquiryId = Array.isArray(quotation.enquiries) ? quotation.enquiries[0]?.id : quotation.enquiries?.id;

    if (!enquiryId) throw new Error("Could not find linked enquiry ID.");

    // 4. Update the enquiry with the live flight data
    const { error: updateError } = await supabase
      .from('enquiries')
      .update({
        flight_status: flightStatus,
        estimated_arrival: estimatedTime,
        actual_arrival: actualTime
      })
      .eq('id', enquiryId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      status: flightStatus,
      scheduledArrival: scheduledTime,
      estimatedArrival: estimatedTime,
      actualArrival: actualTime
    })

  } catch (error: any) {
    console.error("FLIGHT TRACKING ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}