import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { jobId, newStatus } = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const updateData: any = { job_status: newStatus }
    let creditApplied = 0

    // --- DISRUPTION STATE MACHINE ---
    if (newStatus === 'Accepted') {
      updateData.driver_acknowledged_at = new Date().toISOString()
      updateData.disruption_status = 'Acknowledged' 
    }

    if (newStatus === 'Picked Up') {
      const now = new Date()
      updateData.picked_up_at = now.toISOString()
      updateData.disruption_status = 'Resolved'

      // --- SERVICE GUARANTEE LOGIC ---
      // Fetch the job details to get the scheduled pickup_time
      const { data: job } = await supabase
        .from('supplier_bookings')
        .select('pickup_time, quotation_id')
        .eq('id', jobId)
        .single()

      if (job?.pickup_time) {
        // pickup_time is formatted as "HH:MM" (e.g., "14:30")
        const [hours, minutes] = job.pickup_time.split(':')
        const scheduledTime = new Date()
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        // Calculate the difference in minutes
        const diffInMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60)

        // If driver is > 10 mins late, apply Rs 500 credit to the booking
        if (diffInMinutes > 10) {
          creditApplied = 500 
          
          // Update the bookings table (client's main invoice)
          // Casting to 'any' to bypass Supabase's strict nested type inference
          const { data: quotation } = await supabase
            .from('quotations')
            .select('bookings(id)')
            .eq('id', job.quotation_id)
            .single()
          
          const quoteData = quotation as any
          const bookingId = Array.isArray(quoteData?.bookings) ? quoteData.bookings[0]?.id : quoteData?.bookings?.id

          if (bookingId) {
            await supabase
              .from('bookings')
              .update({ service_credit: creditApplied })
              .eq('id', bookingId)
          }
        }
      }
    }

    if (newStatus === 'Completed') {
      updateData.disruption_status = 'Resolved'
    }

    // Update the supplier booking status
    await supabase
      .from('supplier_bookings')
      .update(updateData)
      .eq('id', jobId)

    return NextResponse.json({ success: true, creditApplied })
  } catch (error: any) {
    console.error('UPDATE STATUS ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}