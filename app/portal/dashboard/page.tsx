"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Plane, LogOut, ArrowRight } from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Get the client ID from the cookie
      const clientId = document.cookie.split('; ').find(row => row.startsWith('client_session='))?.split('=')[1]
      
      if (!clientId) {
        router.push('/portal/login')
        return
      }

      // Fetch client name
      const { data: customer } = await supabase.from('customers').select('full_name').eq('id', clientId).single()
      if (customer) setClientName(customer.full_name)

      // Fetch all their bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`*, quotations ( enquiries ( customer_id ) )`)
        .neq('payment_status', 'Pending')
      
      if (bookingsData) {
        // Filter to only show this client's bookings
        const myBookings = bookingsData.filter((b: any) => b.quotations?.enquiries?.customer_id === clientId)
        setBookings(myBookings)
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  function handleLogout() {
    document.cookie = "client_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/portal/login')
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] p-6 md:p-12 font-sans text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-12 border-b border-[#E5DFD3] pb-6">
          <div>
            <h1 className="font-serif text-4xl text-[#1B4D3E]">Welcome back, {clientName}</h1>
            <p className="text-sm text-gray-500 mt-1">Your private travel history with Peace and Afrova</p>
          </div>
          <button onClick={handleLogout} className="text-xs tracking-widest uppercase text-gray-500 hover:text-red-600 flex items-center gap-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading your trips...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 text-center border border-[#E5DFD3] shadow-sm">
            <Plane size={48} className="mx-auto text-[#C9A961] mb-4" />
            <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-8">You haven't completed a journey with us yet.</p>
            <Link href="/experiences" className="btn-primary">Explore Experiences</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 shadow-sm border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Ref: {booking.booking_ref}</div>
                  <div className="font-serif text-xl text-[#1B4D3E]">{booking.customer_name}</div>
                  <div className="text-sm text-gray-600">Travel Date: {booking.travel_start}</div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/portal/itinerary?ref=${booking.booking_ref}`} className="flex items-center gap-2 bg-[#1B4D3E] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
                    View Itinerary <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}