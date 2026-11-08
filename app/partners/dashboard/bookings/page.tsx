"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { Calendar, MapPin, CheckCircle, Clock, FileText } from 'lucide-react'

export default function PartnerBookings() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/partners/login'); return }

        // Get partner record
        const { data: partner } = await supabase.from('partners').select('id').eq('email', session.user.email).single()
        
        if (partner) {
          // Fetch confirmed supplier bookings for this partner
          const { data, error } = await supabase
            .from('supplier_bookings')
            .select(`
              *,
              quotations ( 
                booking_ref,
                travel_start,
                enquiries ( customers ( full_name ) )
              )
            `)
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false })
            
          if (data) setBookings(data)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1B4D3E] animate-pulse">Loading bookings...</div>

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#1B4D3E]">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-2">Confirmed operational assignments for your team.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 shadow-sm border border-[#E5DFD3]">
          <Calendar className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">No confirmed bookings yet</h2>
          <p>When a quote is accepted, the operational job will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                <th className="p-4 font-medium">Ref & Client</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#4A4A4A] font-light">
              {bookings.map((booking) => {
                const quotation = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
                const enquiry = Array.isArray(quotation?.enquiries) ? quotation.enquiries[0] : quotation?.enquiries;
                const customer = Array.isArray(enquiry?.customers) ? enquiry.customers[0] : enquiry?.customers;
                
                return (
                  <tr key={booking.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                    <td className="p-4">
                      <div className="font-medium text-[#1B4D3E]">{customer?.full_name || 'Client'}</div>
                      <div className="text-xs text-gray-500">{quotation?.booking_ref}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{booking.service_description}</div>
                      {booking.driver_name && <div className="text-xs text-gray-500">Driver: {booking.driver_name}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#C9A961]" />
                        {quotation?.travel_start}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm font-bold ${
                        booking.job_status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        booking.job_status === 'Picked Up' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {booking.job_status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}