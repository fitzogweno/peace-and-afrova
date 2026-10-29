"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Clock, CheckCircle, FileText, Send, Navigation, RefreshCw } from 'lucide-react'

export default function BookingsOperations() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI Locks
  const [processingItemId, setProcessingItemId] = useState<string | null>(null)
  const [trackingBookingRef, setTrackingBookingRef] = useState<string | null>(null)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          quotations (
            quotation_items ( * ),
            supplier_bookings ( * ),
            enquiries (
              arrival_flight,
              departure_flight,
              flight_status,
              estimated_arrival,
              customers ( full_name, email )
            )
          )
        `)
        .neq('payment_status', 'Pending')
        .order('created_at', { ascending: false })
      
      if (error) console.error("Error fetching operations:", error)
      if (data) setBookings(data)
      setLoading(false)
    }
    fetchBookings()
  }, [router])

  const handleBookSupplier = async (booking: any, item: any) => {
    setProcessingItemId(item.id)

    const confNumber = prompt(`Enter the ATS Confirmation Number for:\n${item.description}`)
    if (!confNumber) { setProcessingItemId(null); return; }

    const driverName = prompt(`Enter the Driver's Name (e.g. Rishi):`)
    if (driverName === null) { setProcessingItemId(null); return; }

    const driverPhone = prompt(`Enter the Driver's Phone Number (e.g. +230 5740 0125):`)
    if (driverPhone === null) { setProcessingItemId(null); return; }

    const driverEmail = prompt(`Enter the Driver's Email Address (for job assignment):`)
    if (driverEmail === null) { setProcessingItemId(null); return; }

    const vehiclePlate = prompt(`Enter the Vehicle Plate Number (e.g. 1234 AB 56):`)
    if (vehiclePlate === null) { setProcessingItemId(null); return; }

    const clientEmail = booking.quotations?.enquiries?.customers?.email
    const clientName = booking.quotations?.enquiries?.customers?.full_name

    const res = await fetch('/api/supplier-booking', {
      method: 'POST',
      body: JSON.stringify({ 
        quotationId: booking.quotation_id, 
        serviceDescription: item.description, 
        confirmationNumber: confNumber,
        driverName: driverName,
        driverPhone: driverPhone,
        driverEmail: driverEmail,
        vehiclePlate: vehiclePlate,
        bookingRef: booking.booking_ref,
        clientEmail: clientEmail,
        clientName: clientName
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
    if (!flightNumber) return alert("No flight number provided for this booking.")
    
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

  const handleSendInvite = async (booking: any) => {
    const clientEmail = booking.quotations?.enquiries?.customers?.email
    const clientName = booking.customer_name

    if (!clientEmail) return alert("No email found for this client.")
    if (!confirm(`Send Portal Invite email to ${clientName}?`)) return

    const res = await fetch('/api/send-invite', {
      method: 'POST',
      body: JSON.stringify({ clientEmail, clientName })
    })

    if (res.ok) alert("Portal Invite sent successfully!")
    else alert("Failed to send invite.")
  }

  const calculateGP = (items: any[]) => {
    if (!items || items.length === 0) return 0;
    const revenue = items.reduce((acc, item) => acc + (item.sell_price * item.pax), 0)
    const cost = items.reduce((acc, item) => acc + (item.supplier_cost * item.pax), 0)
    return revenue - cost
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className="block opacity-70 hover:opacity-100 transition">Dashboard</Link>
          <Link href="/admin/bookings" className="block text-[#C9A961]">Operations & Bookings</Link>
          <Link href="/admin/finance" className="block opacity-70 hover:opacity-100 transition">Finance</Link>
          <Link href="/admin/reviews" className="block opacity-70 hover:opacity-100 transition">Manage Reviews</Link>
          <Link href="/admin/rates" className="block opacity-70 hover:opacity-100 transition">Rate Catalog</Link>
        </nav>
        <button onClick={() => {
          document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push('/admin/login')
        }} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto">
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
              const items = booking.quotations?.quotation_items || []
              const supplierBookings = booking.quotations?.supplier_bookings || []
              const grossProfit = calculateGP(items)
              const arrivalFlight = booking.quotations?.enquiries?.arrival_flight
              const flightStatus = booking.quotations?.enquiries?.flight_status
              const estimatedArrival = booking.quotations?.enquiries?.estimated_arrival
              const isTracking = trackingBookingRef === booking.booking_ref

              return (
                <div key={booking.id} className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
                  
                  <div className="bg-[#FAF7F0] px-6 py-4 border-b border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="bg-[#1B4D3E] text-white text-xs px-2 py-1 rounded-sm tracking-wider">{booking.booking_ref}</span>
                        <span className="text-xs tracking-widest uppercase text-[#3D8B8B] font-medium">Confirmed Booking</span>
                        
                        <button 
                          onClick={() => handleSendInvite(booking)}
                          className="text-xs bg-[#C9A961] text-[#1B4D3E] px-3 py-1 uppercase tracking-wider hover:bg-white border border-[#C9A961] transition flex items-center gap-1"
                        >
                          <Send size={12} /> Send Portal Invite
                        </button>
                      </div>
                      <h3 className="font-serif text-2xl text-[#1B4D3E]">{booking.customer_name}</h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">Travel Date: {booking.travel_start}</p>
                      </div>

                      {/* FLIGHT TRACKING SECTION */}
                      {arrivalFlight && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-xs font-medium text-[#1B4D3E] bg-[#FAF7F0] border border-[#E5DFD3] px-2 py-1 flex items-center gap-1">
                            <Navigation size={12} className="text-[#C9A961]" /> Flight: {arrivalFlight}
                          </span>
                          
                          <button
                            onClick={() => handleTrackFlight(booking.booking_ref, arrivalFlight)}
                            disabled={isTracking}
                            className="text-xs bg-[#C9A961] text-[#1B4D3E] px-3 py-1 uppercase tracking-wider hover:bg-white border border-[#C9A961] transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <RefreshCw size={12} className={isTracking ? 'animate-spin' : ''} /> 
                            {isTracking ? 'Tracking...' : 'Track Flight'}
                          </button>

                          {flightStatus && (
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 border border-blue-200">
                              Status: {flightStatus} 
                              {estimatedArrival && ` | ETA: ${new Date(estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          )}
                        </div>
                      )}

                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Gross Profit (Est.)</div>
                      <div className="text-xl font-serif text-green-700">Rs {grossProfit.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-4 font-medium flex items-center gap-2">
                      <FileText size={16} /> Supplier Services to Book
                    </h4>
                    
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
                                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                      <CheckCircle size={14} /> Booked (Ref: {savedBooking.confirmation_number})
                                    </span>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider text-right">
                                      Driver: {savedBooking.driver_name || 'N/A'} · Plate: {savedBooking.vehicle_plate || 'N/A'}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-1 rounded-sm ${
                                      savedBooking.job_status === 'Completed' ? 'text-green-700 bg-green-100' :
                                      savedBooking.job_status === 'Picked Up' ? 'text-blue-700 bg-blue-100' :
                                      savedBooking.job_status === 'En Route' ? 'text-orange-700 bg-orange-100' : 'text-gray-500 bg-gray-100'
                                    }`}>
                                      Status: {savedBooking.job_status || 'Pending'}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                      <Clock size={14} /> Pending
                                    </span>
                                    <button 
                                      onClick={() => handleBookSupplier(booking, item)}
                                      disabled={isProcessing}
                                      className={`text-sm font-medium underline underline-offset-4 transition ${
                                        isProcessing 
                                          ? 'text-gray-400 cursor-not-allowed' 
                                          : 'text-[#3D8B8B] hover:text-[#1B4D3E]'
                                      }`}
                                    >
                                      {isProcessing ? 'Processing...' : 'Mark as Booked'}
                                    </button>
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
      </main>
    </div>
  )
}