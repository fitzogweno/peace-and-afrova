import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { sendWhatsAppMessage } from '../../../lib/whatsapp'

export async function POST(req: Request) {
  try {
    const { flightNumber, bookingRef } = await req.json()
    const apiKey = process.env.AERODATABOX_API_KEY
    if (!apiKey) throw new Error("AERODATABOX_API_KEY is not set.")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Fetch the quotation, linked enquiry, and assigned supplier booking (driver)
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select(`
        id, 
        travel_start, 
        enquiries ( id, arrival_flight, estimated_arrival, customers ( full_name, email ) ),
        supplier_bookings ( id, driver_name, driver_phone, driver_email, pickup_time )
      `)
      .eq('booking_ref', bookingRef)
      .single()

    if (quoteError || !quotation) throw new Error("Booking not found.")

    const travelDate = quotation.travel_start
    
    // Safely extract nested data (handling Supabase array returns)
    const enquiry = Array.isArray(quotation.enquiries) ? quotation.enquiries[0] : quotation.enquiries;
    const customer = Array.isArray(enquiry?.customers) ? enquiry.customers[0] : enquiry?.customers;
    const supplierBooking = Array.isArray(quotation.supplier_bookings) ? quotation.supplier_bookings[0] : quotation.supplier_bookings;

    const oldEta = enquiry?.estimated_arrival
    const oldPickup = supplierBooking?.pickup_time

    // 2. Fetch live flight data from AeroDataBox
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
    if (!flightData || flightData.length === 0) throw new Error("No flight data found.")
    
    const flight = flightData[0]
    const arrivalInfo = flight.arrival
    const flightStatus = flight.status 
    const scheduledTime = arrivalInfo.scheduledTime.local
    const estimatedTime = arrivalInfo.revisedTime?.local || scheduledTime
    const actualTime = arrivalInfo.actualTime?.local

    if (!enquiry?.id) throw new Error("Could not find linked enquiry ID.")

    // 3. Update the enquiry with the live flight data
    const { error: updateError } = await supabase
      .from('enquiries')
      .update({
        flight_status: flightStatus,
        estimated_arrival: estimatedTime,
        actual_arrival: actualTime
      })
      .eq('id', enquiry.id)

    if (updateError) throw updateError

    // =====================================================================
    // 4. THE LIVE RE-PLANNING ENGINE
    // =====================================================================
    let delayMinutes = 0
    let newPickupTime = oldPickup

    if (oldEta && estimatedTime && oldPickup) {
      const oldTime = new Date(oldEta).getTime()
      const newTime = new Date(estimatedTime).getTime()
      delayMinutes = Math.round((newTime - oldTime) / (1000 * 60))

      // If the flight is delayed by more than 30 minutes, shift the pickup time and alert the driver
      if (delayMinutes > 30) {
        
        // A. Calculate the new pickup time by shifting it by the exact delay
        const [hours, minutes] = oldPickup.split(':')
        const pickupDate = new Date()
        pickupDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        pickupDate.setMinutes(pickupDate.getMinutes() + delayMinutes)
        newPickupTime = pickupDate.toTimeString().slice(0, 5) // Format back to "HH:MM"

        // B. Update the driver's portal AND log the disruption state
        await supabase
          .from('supplier_bookings')
          .update({ 
            pickup_time: newPickupTime,
            original_pickup_time: oldPickup,
            delay_minutes: delayMinutes,
            disruption_status: 'Notified' 
          })
          .eq('id', supplierBooking.id)

        // C. Send Email and WhatsApp to the Driver
        if (supplierBooking?.driver_email && supplierBooking?.driver_phone) {
          
          const formattedPhone = supplierBooking.driver_phone.replace(/\s+/g, '')
          
          // WhatsApp Alert
          const waMessage = `⚠️ *FLIGHT DELAY ALERT*\n\nHi ${supplierBooking.driver_name}, flight ${flightNumber} for ${customer?.full_name} is delayed by ${delayMinutes} mins.\n\nNew ETA: *${new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}*\nYour pickup time has been auto-adjusted to: *${newPickupTime}*.\n\nCheck your portal for details.`
          
          await sendWhatsAppMessage(formattedPhone, waMessage)

          // Driver Email Alert
          await resend.emails.send({
            from: 'Peace and Afrova <dispatch@peaceandafrova.com>',
            to: [supplierBooking.driver_email],
            subject: `⚠️ FLIGHT DELAY: New Pickup Time for ${customer?.full_name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1B4D3E;">Flight Delay Alert</h2>
                <p>Hi <strong>${supplierBooking.driver_name}</strong>,</p>
                <p>Flight <strong>${flightNumber}</strong> for your client <strong>${customer?.full_name}</strong> has been delayed by <strong>${delayMinutes} minutes</strong>.</p>
                
                <div style="background-color: #FAF7F0; padding: 15px; border-left: 4px solid #C9A961; margin: 20px 0;">
                  <p style="margin: 0;"><strong>New Estimated Arrival:</strong> ${new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Auto-Adjusted Pickup Time:</strong> <span style="color: #1B4D3E; font-size: 1.2em;">${newPickupTime}</span></p>
                </div>
                
                <p>Your Driver Portal has been updated automatically. Please adjust your schedule accordingly.</p>
                <br/>
                <p style="font-size: 12px; color: #888;">This is an automated message from the Peace and Afrova Live Re-Planning Engine.</p>
              </div>
            `
          })
        }

        // 🧠 JOURNEY INTELLIGENCE ENGINE: Proactive Client Alert
        if (customer?.email) {
          try {
            await resend.emails.send({
              from: 'Peace and Afrova <concierge@peaceandafrova.com>',
              to: [customer.email],
              subject: `A quick update on your arrival in Mauritius`,
              html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #1B4D3E;">A quick update on your arrival</h2>
                  <p>Dear ${customer.full_name},</p>
                  <p>We are monitoring your flight (<strong>${flightNumber}</strong>) and noticed it is currently delayed.</p>
                  
                  <div style="background-color: #FAF7F0; padding: 15px; border-left: 4px solid #C9A961; margin: 20px 0;">
                    <p style="margin: 0;"><strong>New Estimated Arrival:</strong> ${new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Your Chauffeur:</strong> We have already notified your driver of the new time. They will be waiting for you upon landing.</p>
                  </div>
                  
                  <p>Please do not worry about a thing. Our team is tracking everything, and we will ensure your transfer remains perfectly seamless.</p>
                  <br/>
                  <p>Warm regards,</p>
                  <p><strong>Your Journey Designers</strong><br/>Peace & Afrova</p>
                </div>
              `
            })
          } catch (emailErr) {
            console.error("Failed to send client alert:", emailErr)
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      status: flightStatus,
      scheduledArrival: scheduledTime,
      estimatedArrival: estimatedTime,
      actualArrival: actualTime,
      delayMinutes: delayMinutes > 0 ? delayMinutes : 0,
      newPickupTime: newPickupTime
    })

  } catch (error: any) {
    console.error("FLIGHT TRACKING ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}