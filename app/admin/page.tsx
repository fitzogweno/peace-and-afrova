"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../utils/supabase'
import { Search, Hotel, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [pendingBookings, setPendingBookings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchData() {
      // 1. Fetch New Enquiries (not yet quoted)
      const { data: enqData } = await supabase
        .from('enquiries')
        .select(`*, customers (full_name, email, phone), quotations!left(id)`)
        .is('quotations', null)
        .order('created_at', { ascending: false })
      
      if (enqData) setEnquiries(enqData)

      // 2. Fetch ALL Bookings (for the global search)
      const { data: bookData } = await supabase
        .from('bookings')
        .select(`*, quotations ( enquiries ( customers ( full_name, email ) ) )`)
        .order('created_at', { ascending: false })
      
      if (bookData) setAllBookings(bookData)

      // 3. Fetch Pending Payments
      const { data: pendingData } = await supabase
        .from('bookings')
        .select(`*, payments ( id, amount )`)
        .eq('payment_status', 'Pending')
      
      if (pendingData) setPendingBookings(pendingData)
      
      setLoading(false)
    }
    fetchData()
  }, [router])

  async function handleConfirmPayment(bookingId: string, paymentId: string) {
    if (!confirm("Have you verified this deposit in your bank account?")) return
    const res = await fetch('/api/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentId })
    })
    if (res.ok) {
      alert("Payment Confirmed!")
      window.location.reload() 
    }
  }

  // Filter enquiries based on search
  const filteredEnquiries = enquiries.filter(enq => 
    enq.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.customers?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter bookings based on search
  const filteredBookings = allBookings.filter(book => 
    book.booking_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.quotations?.enquiries?.customers?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className="block text-[#C9A961]">Dashboard</Link>
          <Link href="/admin/bookings" className="block opacity-70 hover:opacity-100 transition">Operations & Bookings</Link>
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
        
        {/* Global Search Bar */}
        <div className="mb-8 flex justify-between items-center bg-white p-4 border border-[#E5DFD3] shadow-sm">
          <div className="flex items-center gap-2 w-full max-w-md">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by client name, email, or booking ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* If searching, show Search Results */}
        {searchTerm ? (
          <div className="mb-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6">Search Results</h2>
            
            {filteredEnquiries.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">New Enquiries</h3>
                <div className="bg-white shadow-sm border border-[#E5DFD3] p-4 space-y-2">
                  {filteredEnquiries.map(enq => (
                    <div key={enq.id} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-medium text-[#1B4D3E]">{enq.customers?.full_name}</div>
                        <div className="text-xs text-gray-500">{enq.customers?.email} | Travel: {enq.travel_start}</div>
                        {enq.product_interest && (
                          <div className="mt-1 inline-block bg-[#FAF7F0] text-[#C9A961] border border-[#E5DFD3] text-[10px] px-2 py-0.5 uppercase tracking-wider">
                            Interested: {enq.product_interest}
                          </div>
                        )}
                      </div>
                      <Link href={`/admin/quote?id=${enq.id}`} className="text-xs bg-[#1B4D3E] text-white px-3 py-1 uppercase tracking-widest">Quote</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredBookings.length > 0 && (
              <div>
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Confirmed Bookings</h3>
                <div className="bg-white shadow-sm border border-[#E5DFD3] p-4 space-y-2">
                  {filteredBookings.map(book => (
                    <div key={book.id} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FAF7F0] text-[#3D8B8B] text-[10px] px-2 py-0.5 border border-[#E5DFD3] uppercase tracking-wider">{book.booking_ref}</span>
                          <span className="font-medium text-[#1B4D3E]">{book.customer_name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Travel: {book.travel_start} | Payment: {book.payment_status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/bookings`} className="text-xs border border-[#1B4D3E] text-[#1B4D3E] px-3 py-1 uppercase tracking-widest hover:bg-[#FAF7F0]">Operations</Link>
                        <Link href={`/portal/itinerary?ref=${book.booking_ref}`} target="_blank" className="text-xs bg-[#C9A961] text-[#1B4D3E] px-3 py-1 uppercase tracking-widest">Itinerary</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredEnquiries.length === 0 && filteredBookings.length === 0 && (
              <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
                No results found for "{searchTerm}".
              </div>
            )}
          </div>
        ) : (
          <>
            {pendingBookings.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6">Deposits to Confirm</h2>
                <div className="grid gap-4">
                  {pendingBookings.map((booking) => {
                    const paymentId = booking.payments?.[0]?.id || 'test-id'
                    const depositAmount = booking.payments?.[0]?.amount || (booking.total_amount * 0.5)
                    const curr = booking.currency || 'MUR'
                    const displayAmount = curr === 'USD' ? `$${(depositAmount / 45).toFixed(0)}` : curr === 'EUR' ? `€${(depositAmount / 49).toFixed(0)}` : `Rs ${depositAmount.toLocaleString()}`;

                    return (
                      <div key={booking.id} className="bg-white p-6 shadow-sm border-l-4 border-[#C9A961] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                          <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">{booking.booking_ref}</div>
                          <div className="font-medium text-[#1B4D3E]">{booking.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Deposit Due</div>
                          <div className="text-xl font-serif text-[#1B4D3E]">{displayAmount}</div>
                        </div>
                        <button onClick={() => handleConfirmPayment(booking.id, paymentId)} className="bg-[#1B4D3E] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
                          Confirm Deposit
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Recent Enquiries</h1>
            {loading ? (
              <p className="text-[#4A4A4A]">Loading database...</p>
            ) : enquiries.length === 0 ? (
              <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
                <p className="mb-4">No new enquiries. (Quoted enquiries have moved to Operations).</p>
                <Link href="/bespoke" target="_blank" className="text-[#1B4D3E] font-medium underline">Open the Enquiry Form</Link>
              </div>
            ) : (
              <div className="bg-white shadow-sm overflow-x-auto border border-[#E5DFD3]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B] bg-[#FAF7F0]">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Client</th>
                      <th className="p-4 font-medium">Travel Date</th>
                      <th className="p-4 font-medium">Hotel</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-[#4A4A4A] font-light">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                        <td className="p-4 whitespace-nowrap">{new Date(enq.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-medium text-[#1B4D3E]">{enq.customers?.full_name || 'Unknown'}</div>
                          <div className="text-xs">{enq.customers?.email}</div>
                          {enq.product_interest && (
                            <div className="mt-1 inline-block bg-[#FAF7F0] text-[#C9A961] border border-[#E5DFD3] text-[10px] px-2 py-0.5 uppercase tracking-wider">
                              Interested: {enq.product_interest}
                            </div>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">{enq.travel_start}</td>
                        <td className="p-4">
                          {enq.has_hotel === 'no' ? (
                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              <Hotel size={12} /> Needs Hotel
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Booked</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/quote?id=${enq.id}`} className="inline-block bg-[#1B4D3E] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#C9A961] transition">
                            Create Quote
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}