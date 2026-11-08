"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Clock, CheckCircle, FileText, Send, Navigation, RefreshCw, PlaneTakeoff, AlertCircle, UserCheck } from 'lucide-react'

export default function BookingsOperations() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingItemId, setProcessingItemId] = useState<string | null>(null)
  const [trackingBookingRef, setTrackingBookingRef] = useState<string | null>(null)
  const [calculatingDeparture, setCalculatingDeparture] = useState<string | null>(null)
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null)
  const [driverStats, setDriverStats] = useState<Record<string, any>>({})

  useEffect(() => {
    async function initPage() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          quotations (
            id, total, amendment_request, counter_offer_status,
            quotation_items ( * ), supplier_bookings ( * ),
            enquiries (
              arrival_flight, departure_flight, flight_status, estimated_arrival, departure_time, calculated_pickup_time,
              customers ( full_name, email )
            )
          )
        `)
        .neq('payment_status', 'Pending')
        .order('created_at', { ascending: false })
      
      if (error) console.error("Error fetching operations:", error)
      if (data) setBookings(data)

      const { data: allJobs } = await supabase
        .from('supplier_bookings')
        .select('driver_name, job_status, delay_minutes')
        .not('driver_name', 'is', null)

      if (allJobs) {
        const stats = allJobs.reduce((acc: any, job: any) => {
          const name = job.driver_name
          if (!acc[name]) acc[name] = { total: 0, late: 0 }
          acc[name].total += 1
          if (job.delay_minutes > 0) acc[name].late += 1
          return acc
        }, {})
        setDriverStats(stats)
      }
      setLoading(false)
    }
    initPage()
  }, [router])

  const getEnquiryData = (booking: any) => {
    const quotation = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
    if (!quotation) return null;
    const enquiries = quotation.enquiries;
    return Array.isArray(enquiries) ? enquiries[0] : enquiries;
  }

  const handleBookSupplier = async (booking: any, item: any) => {
    setProcessingItemId(item.id)
    const confNumber = prompt(`Enter the ATS Confirmation Number for:\n${item.description}`)
    if (!confNumber) { setProcessingItemId(null); return; }
    
    const driverName = prompt(`Enter the Driver's Name (e.g. Rishi):`)
    if (driverName === null) { setProcessingItemId(null); return; }

    const stats = driverStats[driverName]
    if (stats && stats.total > 2) {
      const lateRate = Math.round((stats.late / stats.total) * 100)
      if (lateRate > 20) {
        const proceed = confirm(`⚠️ OPERATIONAL WARNING:\n\nDriver "${driverName}" has a ${lateRate}% late arrival rate (${stats.late} delays out of ${stats.total} jobs).\n\nAre you sure you want to assign this driver?`)
        if (!proceed) { setProcessingItemId(null); return; }
      }
    }

    const driverPhone = prompt(`Enter the Driver's Phone Number:`)
    if (driverPhone === null) { setProcessingItemId(null); return; }
    const driverEmail = prompt(`Enter the Driver's Email Address:`)
    if (driverEmail === null) { setProcessingItemId(null); return; }
    const vehiclePlate = prompt(`Enter the Vehicle Plate Number:`)
    if (vehiclePlate === null) { setProcessingItemId(null); return; }

    const enquiry = getEnquiryData(booking);
    
    const res = await fetch('/api/supplier-booking', {
      method: 'POST',
      body: JSON.stringify({ 
        quotationId: booking.quotation_id, serviceDescription: item.description, confirmationNumber: confNumber,
        driverName, driverPhone, driverEmail, vehiclePlate, bookingRef: booking.booking_ref,
        clientEmail: enquiry?.customers?.email, clientName: enquiry?.customers?.full_name
      })
    })

    if (res.ok) {
      alert("Supplier booked! Client and Driver notified automatically.")
      window.location.reload()
    } else {
      alert("Failed to save confirmation.")
      setProcessingItemId(null)
    }
  }

  const handleTrackFlight = async (bookingRef: string, flightNumber: string) => {
    if (!flightNumber) return alert("No arrival flight number provided.")
    setTrackingBookingRef(bookingRef)
    try {
      const res = await fetch('/api/track-flight', {
        method: 'POST',
        body: JSON.stringify({ flightNumber, bookingRef })
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Flight Updated: ${data.status} (ETA: ${new Date(data.estimatedArrival).toLocaleTimeString()})`)
        window.location.reload()
      } else {
        const errorData = await res.json()
        alert(`Failed to track flight: ${errorData.error}`)
      }
    } catch (err) {
      alert("Error connecting to flight tracking API.")
    }
    setTrackingBookingRef(null)
  }

  const handleCalculateDeparture = async (bookingRef: string, flightNumber: string) => {
    if (!flightNumber) return alert("No departure flight number provided.")
    setCalculatingDeparture(bookingRef)
    try {
      const res = await fetch('/api/calculate-departure', {
        method: 'POST',
        body: JSON.stringify({ flightNumber, bookingRef })
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Departure Pickup Calculated: ${data.calculatedPickupTime}`)
        window.location.reload()
      } else {
        const error = await res.json()
        alert(`Failed to calculate: ${error.error}`)
      }
    } catch (err) {
      alert("Error calculating departure time.")
    }
    setCalculatingDeparture(null)
  }

  const handleSendInvite = async (booking: any) => {
    const enquiry = getEnquiryData(booking);
    if (!enquiry?.customers?.email) return alert("No email found for this client.")
    if (!confirm(`Send Portal Invite email to ${booking.customer_name}?`)) return
    const res = await fetch('/api/send-invite', {
      method: 'POST',
      body: JSON.stringify({ clientEmail: enquiry.customers.email, clientName: booking.customer_name })
    })
    if (res.ok) alert("Portal Invite sent successfully!")
    else alert("Failed to send invite.")
  }

  const handleProcessCounterOffer = async (quoteId: string, action: 'accept' | 'decline', newTotal?: number) => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return
    setProcessingOfferId(quoteId)
    try {
      const res = await fetch('/api/process-counter-offer', {
        method: 'POST',
        body: JSON.stringify({ quoteId, action, newTotal })
      })
      if (res.ok) {
        alert(`Request ${action}ed successfully.`)
        window.location.reload()
      } else {
        alert("Failed to process request.")
      }
    } catch (err) {
      alert("Error processing request.")
    }
    setProcessingOfferId(null)
  }

  const calculateGP = (items: any[]) => {
    if (!items || items.length === 0) return 0;
    const revenue = items.reduce((acc, item) => acc + (item.sell_price * item.pax), 0)
    const cost = items.reduce((acc, item) => acc + (item.supplier_cost * item.pax), 0)
    return revenue - cost
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Operations Desk</h1>
      
      {loading ? (
        <p className="text-[#4A4A4A]">Loading confirmed bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
          <p>No confirmed bookings yet. Confirm a deposit on the dashboard to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const enquiry = getEnquiryData(booking);
            const quotation = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
            const items = quotation?.quotation_items || []
            const supplierBookings = quotation?.supplier_bookings || []
            const grossProfit = calculateGP(items)
            const hasPendingOffer = quotation?.counter_offer_status === 'Pending'

            return (
              <div key={booking.id} className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
                {hasPendingOffer && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                      <div>
                        <h4 className="font-bold text-red-800 text-sm">Client Requested to Tailor Proposal</h4>
                        <p className="text-sm text-red-600 mb-2">{quotation.amendment_request}</p>
                        <p className="text-xs text-red-500">Original Total: Rs {quotation.total?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => {
                          const newTotalStr = prompt("Enter the NEW total amount (Rs):", quotation.total);
                          if (!newTotalStr) return;
                          const newTotal = parseFloat(newTotalStr);
                          if (isNaN(newTotal)) return alert("Invalid number");
                          handleProcessCounterOffer(quotation.id, 'accept', newTotal);
                        }}
                        disabled={processingOfferId === quotation.id}
                        className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Accept & Update Price
                      </button>
                      <button onClick={() => handleProcessCounterOffer(quotation.id, 'decline')} disabled={processingOfferId === quotation.id} className="flex-1 md:flex-none bg-gray-600 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-gray-700 transition disabled:opacity-50">Decline</button>
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF7F0] px-6 py-4 border-b border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="bg-[#1B4D3E] text-white text-xs px-2 py-1 rounded-sm tracking-wider">{booking.booking_ref}</span>
                      <span className="text-xs tracking-widest uppercase text-[#3D8B8B] font-medium">Confirmed Booking</span>
                      <button onClick={() => handleSendInvite(booking)} className="text-xs bg-[#C9A961] text-[#1B4D3E] px-3 py-1 uppercase tracking-wider hover:bg-white border border-[#C9A961] transition flex items-center gap-1"><Send size={12} /> Send Portal Invite</button>
                    </div>
                    <h3 className="font-serif text-2xl text-[#1B4D3E]">{booking.customer_name}</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1"><p className="text-sm text-gray-600">Travel Date: {booking.travel_start}</p></div>

                    <div className="mt-3 space-y-2">
                      {enquiry?.arrival_flight && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-[#1B4D3E] bg-white border border-[#E5DFD3] px-2 py-1 flex items-center gap-1"><Navigation size={12} className="text-[#C9A961]" /> Arrival: {enquiry.arrival_flight}</span>
                          <button onClick={() => handleTrackFlight(booking.booking_ref, enquiry.arrival_flight)} disabled={trackingBookingRef === booking.booking_ref} className="text-xs bg-[#C9A961] text-[#1B4D3E] px-3 py-1 uppercase tracking-wider hover:bg-white border border-[#C9A961] transition disabled:opacity-50 flex items-center gap-1"><RefreshCw size={12} className={trackingBookingRef === booking.booking_ref ? 'animate-spin' : ''} /> {trackingBookingRef === booking.booking_ref ? 'Tracking...' : 'Track Flight'}</button>
                          {enquiry?.flight_status && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 border border-blue-200">Status: {enquiry.flight_status} {enquiry.estimated_arrival && ` | ETA: ${new Date(enquiry.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>}
                        </div>
                      )}

                      {enquiry?.departure_flight && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-[#1B4D3E] bg-white border border-[#E5DFD3] px-2 py-1 flex items-center gap-1"><PlaneTakeoff size={12} className="text-[#C9A961]" /> Departure: {enquiry.departure_flight}</span>
                          {!enquiry.calculated_pickup_time ? (
                            <button onClick={() => handleCalculateDeparture(booking.booking_ref, enquiry.departure_flight)} disabled={calculatingDeparture === booking.booking_ref} className="text-xs bg-[#1B4D3E] text-white px-3 py-1 uppercase tracking-wider hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 flex items-center gap-1 border border-[#1B4D3E]"><Clock size={12} className={calculatingDeparture === booking.booking_ref ? 'animate-spin' : ''} /> {calculatingDeparture === booking.booking_ref ? 'Calculating...' : 'Calculate Pickup'}</button>
                          ) : (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 border border-green-200">Pickup at Hotel: {enquiry.calculated_pickup_time}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {booking.intake_submitted && (
                      <div className="mt-5 bg-white border border-[#E5DFD3] p-4 rounded-sm shadow-sm">
                        <div className="font-bold text-[#1B4D3E] mb-3 uppercase tracking-widest text-[10px] flex items-center gap-2"><UserCheck size={14} className="text-[#C9A961]" /> Pre-Arrival Profile</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-[#4A4A4A]">
                          <div><span className="text-gray-400 text-xs block uppercase tracking-wider mb-0.5">Arrival Flight</span> <strong className="text-[#1B4D3E]">{booking.intake_flight || 'N/A'}</strong></div>
                          <div><span className="text-gray-400 text-xs block uppercase tracking-wider mb-0.5">Dietary Needs</span> <strong className="text-[#1B4D3E]">{booking.dietary_needs || 'None'}</strong></div>
                          <div><span className="text-gray-400 text-xs block uppercase tracking-wider mb-0.5">Occasion</span> <strong className="text-[#1B4D3E]">{booking.special_occasion || 'None'}</strong></div>
                          <div><span className="text-gray-400 text-xs block uppercase tracking-wider mb-0.5">Car Seats</span> <strong className="text-[#1B4D3E]">{booking.car_seats || 'None'}</strong></div>
                          <div className="col-span-2"><span className="text-gray-400 text-xs block uppercase tracking-wider mb-0.5">Preferred Pace</span> <strong className="text-[#1B4D3E]">{booking.pace_preference || 'N/A'}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Gross Profit (Est.)</div>
                    <div className="text-xl font-serif text-green-700">Rs {grossProfit.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-4 font-medium flex items-center gap-2"><FileText size={16} /> Supplier Services to Book</h4>
                  {items.length === 0 ? (
                    <p className="text-sm text-red-500">No services found.</p>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item: any) => {
                        const savedBooking = supplierBookings.find((sb: any) => sb.service_description === item.description)
                        const isBooked = !!savedBooking
                        const isProcessing = processingItemId === item.id
                        if (!item.description) return null;
                        return (
                          <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#E5DFD3] rounded-sm hover:bg-[#FAF7F0] transition gap-4">
                            <div>
                              <div className="font-medium text-[#1B4D3E]">{item.description}</div>
                              <div className="text-xs text-gray-500">Pax: {item.pax} | Net Cost: Rs {item.supplier_cost.toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                              {isBooked ? (
                                <>
                                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full"><CheckCircle size={14} /> Booked (Ref: {savedBooking.confirmation_number})</span>
                                  <div className="text-[10px] text-gray-500 uppercase tracking-wider text-right">Driver: {savedBooking.driver_name || 'N/A'} · Plate: {savedBooking.vehicle_plate || 'N/A'}</div>
                                </>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full"><Clock size={14} /> Pending</span>
                                  <button onClick={() => handleBookSupplier(booking, item)} disabled={isProcessing} className={`text-sm font-medium underline underline-offset-4 transition ${isProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-[#3D8B8B] hover:text-[#1B4D3E]'}`}>{isProcessing ? 'Processing...' : 'Mark as Booked'}</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}