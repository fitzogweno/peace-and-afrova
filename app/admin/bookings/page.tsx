"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Clock, CheckCircle, FileText } from 'lucide-react'

export default function BookingsOperations() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchBookings() {
      // Fetch confirmed bookings (anything that isn't 'Pending')
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          quotations (
            quotation_items ( * ),
            supplier_bookings ( * )
          )
        `)
        .neq('payment_status', 'Pending') // This catches Partially Paid or Paid
        .order('created_at', { ascending: false })
      
      if (error) console.error("Error fetching operations:", error)
      if (data) setBookings(data)
      setLoading(false)
    }
    fetchBookings()
  }, [router])

  const handleBookSupplier = async (quotationId: string, serviceDesc: string) => {
    const confNumber = prompt(`Enter the ATS Confirmation Number for:\n${serviceDesc}`)
    if (!confNumber) return

    const res = await fetch('/api/supplier-booking', {
      method: 'POST',
      body: JSON.stringify({ quotationId, serviceDescription: serviceDesc, confirmationNumber: confNumber })
    })

    if (res.ok) {
      alert("Supplier confirmed and saved!")
      window.location.reload()
    } else {
      alert("Failed to save confirmation.")
    }
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

              return (
                <div key={booking.id} className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
                  
                  {/* Booking Header */}
                  <div className="bg-[#FAF7F0] px-6 py-4 border-b border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-[#1B4D3E] text-white text-xs px-2 py-1 rounded-sm tracking-wider">{booking.booking_ref}</span>
                        <span className="text-xs tracking-widest uppercase text-[#3D8B8B] font-medium">Confirmed Booking</span>
                      </div>
                      <h3 className="font-serif text-2xl text-[#1B4D3E]">{booking.customer_name}</h3>
                      <p className="text-sm text-gray-600">Travel Date: {booking.travel_start}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Gross Profit (Est.)</div>
                      <div className="text-xl font-serif text-green-700">Rs {grossProfit.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Operational Tasks */}
                  <div className="p-6">
                    <h4 className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-4 font-medium flex items-center gap-2">
                      <FileText size={16} /> Supplier Services to Book
                    </h4>
                    
                    {items.length === 0 ? (
                      <p className="text-sm text-red-500">No services found. Make sure you added items before saving the quote.</p>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item: any) => {
                          // Check if this item has a confirmation number saved
                          const savedBooking = supplierBookings.find((sb: any) => sb.service_description === item.description)
                          const isBooked = !!savedBooking

                          // Skip blank items (like the accidental Rs 0 line)
                          if (!item.description) return null;

                          return (
                            <div key={item.id} className="flex items-center justify-between p-4 border border-[#E5DFD3] rounded-sm hover:bg-[#FAF7F0] transition">
                              <div>
                                <div className="font-medium text-[#1B4D3E]">{item.description}</div>
                                <div className="text-xs text-gray-500">Pax: {item.pax} | Net Cost: Rs {item.supplier_cost.toLocaleString()}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isBooked ? (
                                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                    <CheckCircle size={14} /> Booked (Ref: {savedBooking.confirmation_number})
                                  </span>
                                ) : (
                                  <>
                                    <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                      <Clock size={14} /> Pending
                                    </span>
                                    <button 
                                      onClick={() => handleBookSupplier(booking.quotation_id, item.description)}
                                      className="text-sm text-[#3D8B8B] font-medium hover:text-[#1B4D3E] underline decoration-[#3D8B8B] underline-offset-4"
                                    >
                                      Mark as Booked
                                    </button>
                                  </>
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