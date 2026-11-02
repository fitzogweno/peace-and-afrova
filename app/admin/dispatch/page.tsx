"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Calendar, RefreshCw, Plane, MapPin, User, AlertTriangle, Copy } from 'lucide-react'

export default function DispatchBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    setSelectedDate(`${year}-${month}-${day}`)
  }, [])

  useEffect(() => {
    if (!selectedDate) return;

    let isActive = true

    async function initPage() {
      setLoading(true)

      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) throw authError
        if (!session) {
          router.push('/admin/login')
          return
        }

        const { data, error } = await supabase
          .from('supplier_bookings')
          .select(`
            id, service_description, pickup_time, driver_name, vehicle_plate, confirmation_number,
            quotations (
              bookings ( travel_start, customer_name, car_seats, dietary_needs ),
              enquiries ( arrival_flight, departure_flight, hotel_details )
            )
          `)
          .order('id', { ascending: true })
        
        if (error) throw error
        if (!isActive) return

        const mappedData = (data || []).map((item: any) => {
          const quotation = Array.isArray(item.quotations) ? item.quotations[0] : item.quotations;
          const booking = Array.isArray(quotation?.bookings) ? quotation.bookings[0] : quotation?.bookings;
          const enquiry = Array.isArray(quotation?.enquiries) ? quotation.enquiries[0] : quotation?.enquiries;
          
          return {
            id: item.id, service: item.service_description, pickup: item.pickup_time || '00:00',
            driver: item.driver_name, plate: item.vehicle_plate, ref: item.confirmation_number,
            clientName: booking?.customer_name, travelStart: booking?.travel_start,
            arrivalFlight: enquiry?.arrival_flight, departureFlight: enquiry?.departure_flight,
            hotel: enquiry?.hotel_details, carSeats: booking?.car_seats, dietary: booking?.dietary_needs
          }
        }).filter((item: any) => item.travelStart === selectedDate);

        setBookings(mappedData)
      } catch (error) {
        console.error("Error loading dispatch board:", error)
        if (isActive) setBookings([])
      } finally {
        if (isActive) setLoading(false)
      }
    }
    
    initPage()

    return () => {
      isActive = false
    }
  }, [router, selectedDate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleUpdateTime(id: string, newTime: string) {
    setUpdatingId(id)
    try {
      const response = await fetch('/api/update-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pickup_time: newTime })
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'Failed to update pickup time')
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, pickup: newTime } : b))
    } catch (error) {
      console.error('Pickup update failed:', error)
      alert('Unable to update pickup time. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  // --- IMPROVED COPY MAGIC LINK FUNCTION ---
  async function handleCopyLink(jobId: string) {
    try {
      const magicLink = `${window.location.origin}/driver/job/${jobId}`
      await navigator.clipboard.writeText(magicLink)
      alert("✅ Magic Link copied successfully!\n\nYou can now paste this directly into the driver's WhatsApp.")
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Unable to copy link. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className={`block transition ${pathname === '/admin' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Dashboard</Link>
          <Link href="/admin/bookings" className={`block transition ${pathname === '/admin/bookings' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Operations & Bookings</Link>
          <Link href="/admin/dispatch" className={`block transition ${pathname === '/admin/dispatch' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Dispatch Board</Link>
          <Link href="/admin/suppliers" className={`block transition ${pathname === '/admin/suppliers' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Supplier Scorecard</Link>
          <Link href="/admin/finance" className={`block transition ${pathname === '/admin/finance' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Finance</Link>
          <Link href="/admin/reviews" className={`block transition ${pathname === '/admin/reviews' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Manage Reviews</Link>
          <Link href="/admin/rates" className={`block transition ${pathname === '/admin/rates' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Rate Catalog</Link>
          <Link href="/admin/partners" className={`block transition ${pathname === '/admin/partners' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>B2B Partners</Link>
        </nav>
        <button onClick={handleSignOut} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">Sign Out</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#1B4D3E]">Dispatch Board</h1>
            <p className="text-sm text-gray-500 mt-1">Daily transport manifest</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 border border-[#E5DFD3] shadow-sm">
            <Calendar className="text-[#C9A961]" size={20} />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-none bg-transparent focus:outline-none text-[#1B4D3E] font-medium cursor-pointer" />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-3"><RefreshCw className="animate-spin" size={20} /> Loading manifest...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500"><p className="text-lg">No transports scheduled for this date.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                    <th className="p-4 font-medium">Client & Alerts</th><th className="p-4 font-medium">Service</th><th className="p-4 font-medium">Flight</th><th className="p-4 font-medium">Pickup Location</th><th className="p-4 font-medium w-48">Pickup Time</th><th className="p-4 font-medium">Driver / Vehicle</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#4A4A4A] font-light">
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                      <td className="p-4">
                        <div className="font-medium text-[#1B4D3E] mb-1">{b.clientName}</div>
                        <div className="flex flex-col gap-1">
                          {b.carSeats && <div className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded w-max"><AlertTriangle size={10} /> Car Seat: {b.carSeats}</div>}
                          {b.dietary && <div className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded w-max"><AlertTriangle size={10} /> Diet: {b.dietary}</div>}
                        </div>
                      </td>
                      <td className="p-4"><div className="font-medium">{b.service}</div><div className="text-xs text-gray-400">Ref: {b.ref}</div></td>
                      <td className="p-4">
                        {b.arrivalFlight && <div className="flex items-center gap-1 text-xs"><Plane size={12} className="text-blue-500"/> Arr: {b.arrivalFlight}</div>}
                        {b.departureFlight && <div className="flex items-center gap-1 text-xs mt-1"><Plane size={12} className="text-orange-500 rotate-180"/> Dep: {b.departureFlight}</div>}
                      </td>
                      <td className="p-4"><div className="flex items-center gap-1 text-xs"><MapPin size={14} className="text-[#C9A961]" /> {b.hotel || 'TBC'}</div></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input type="time" defaultValue={b.pickup} onBlur={(e) => { if (e.target.value !== b.pickup) { handleUpdateTime(b.id, e.target.value); } }} className="border border-[#E5DFD3] p-2 rounded-sm text-sm focus:outline-none focus:border-[#C9A961] bg-white w-28" />
                          {updatingId === b.id && <RefreshCw size={14} className="animate-spin text-[#C9A961]" />}
                        </div>
                      </td>
                      <td className="p-4">
                        {b.driver ? (
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1 font-medium text-[#1B4D3E]"><User size={14}/> {b.driver}</div>
                              <button 
                                onClick={() => handleCopyLink(b.id)}
                                className="text-[10px] bg-[#C9A961] text-[#1B4D3E] px-2 py-1 rounded-sm flex items-center gap-1 hover:bg-[#b09552] transition font-bold uppercase tracking-wider"
                                title="Copy Driver Magic Link"
                              >
                                <Copy size={12} /> Link
                              </button>
                            </div>
                            <div className="text-xs mt-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600 inline-block">{b.plate || 'No Plate'}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-orange-500 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}