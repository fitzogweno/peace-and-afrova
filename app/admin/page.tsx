"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../utils/supabase'
import { Mail, Headset, Wallet, AlertCircle, CheckCircle, FileText, Palette, Sparkles } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [pendingBookings, setPendingBookings] = useState<any[]>([])
  const [conciergeRequests, setConciergeRequests] = useState<any[]>([])
  const [upsellRequests, setUpsellRequests] = useState<any[]>([])
  const [pendingBranding, setPendingBranding] = useState<any[]>([])
  const [disruptions, setDisruptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    async function initDashboard() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      // Fetch Enquiries + Quote Status
      const { data: enqData } = await supabase
        .from('enquiries')
        .select(`*, customers (full_name, email, phone), quotations!left(id, quote_status)`)
        .order('created_at', { ascending: false })
      
      if (enqData) {
        const filteredEnquiries = enqData.filter((enq: any) => {
          const q = Array.isArray(enq.quotations) ? enq.quotations[0] : enq.quotations;
          if (!q) return true; 
          if (q.quote_status === 'Draft') return true;
          return false; 
        })
        setEnquiries(filteredEnquiries)
      }

      const { data: bookData } = await supabase.from('bookings').select(`*, quotations ( enquiries ( customers ( full_name, email ) ) )`).order('created_at', { ascending: false })
      if (bookData) setAllBookings(bookData)

      const { data: pendingData } = await supabase.from('bookings').select(`*, payments ( id, amount )`).eq('payment_status', 'Pending')
      if (pendingData) setPendingBookings(pendingData)

      const { data: conciergeData } = await supabase.from('concierge_requests').select('*').eq('status', 'pending').eq('is_upsell', false).order('created_at', { ascending: false })
      if (conciergeData) setConciergeRequests(conciergeData)

      // NEW: Fetch Upsell Requests
      const { data: upsellData } = await supabase.from('concierge_requests').select('*').eq('status', 'pending').eq('is_upsell', true).order('created_at', { ascending: false })
      if (upsellData) setUpsellRequests(upsellData)

      // NEW: Fetch Branding Approvals
      const { data: brandingData } = await supabase.from('bookings').select('id, booking_ref').eq('branding_status', 'pending_approval')
      if (brandingData) setPendingBranding(brandingData)

      const { data: disruptionData } = await supabase.from('supplier_bookings').select(`id, service_description, driver_name, original_pickup_time, pickup_time, delay_minutes, disruption_status, quotations ( bookings ( customer_name ) )`).in('disruption_status', ['Notified', 'Acknowledged'])
      if (disruptionData) setDisruptions(disruptionData)
      
      setLoading(false)
    }
    initDashboard()
  }, [router])

  const totalAlerts = disruptions.length + pendingBookings.length + conciergeRequests.length + upsellRequests.length + pendingBranding.length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* GREETING */}
      <div>
        <h1 className="font-serif text-4xl text-[#1B4D3E]">{greeting}.</h1>
        <p className="text-gray-500 mt-1">Here is your business overview.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-[#E5DFD3] shadow-sm">
          <div className="text-4xl font-serif text-[#1B4D3E] mb-1">{allBookings.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Bookings</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[#E5DFD3] shadow-sm">
          <div className="text-4xl font-serif text-[#1B4D3E] mb-1">{enquiries.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">New Enquiries</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[#E5DFD3] shadow-sm">
          <div className="text-4xl font-serif text-[#C9A961] mb-1">{pendingBookings.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Payments</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-[#E5DFD3] shadow-sm">
          <div className="text-4xl font-serif text-[#1B4D3E] mb-1">{conciergeRequests.length + upsellRequests.length + disruptions.length + pendingBranding.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Operations Tasks</div>
        </div>
      </div>

      {/* ATTENTION REQUIRED */}
      <div className="bg-white rounded-lg border border-[#E5DFD3] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5DFD3] bg-[#FAF7F0]">
          <h2 className="font-bold text-[#1B4D3E]">Attention required</h2>
        </div>
        <div className="p-4 space-y-3">
          {disruptions.length > 0 && (
            <Link href="/admin/dispatch" className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">Operational alert: {disruptions.length} flight disruption(s)</span>
              </div>
              <span className="text-xs font-bold text-red-600 uppercase">Review</span>
            </Link>
          )}
          
          {pendingBranding.length > 0 && (
            <Link href="/admin/branding" className="flex items-center justify-between p-3 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-md hover:bg-[#C9A961]/20 transition">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-[#1B4D3E]" />
                <span className="text-sm font-medium text-[#1B4D3E]">Branding: {pendingBranding.length} logo(s) awaiting approval</span>
              </div>
              <span className="text-xs font-bold text-[#1B4D3E] uppercase">Review</span>
            </Link>
          )}

          {upsellRequests.length > 0 && (
            <Link href="/admin/requests" className="flex items-center justify-between p-3 bg-[#1B4D3E]/5 border border-[#1B4D3E]/10 rounded-md hover:bg-[#1B4D3E]/10 transition">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-[#1B4D3E]" />
                <span className="text-sm font-medium text-[#1B4D3E]">Upsells: {upsellRequests.length} upgrade request(s) to quote</span>
              </div>
              <span className="text-xs font-bold text-[#1B4D3E] uppercase">Review</span>
            </Link>
          )}

          {pendingBookings.length > 0 && (
            <Link href="/admin" className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-md hover:bg-orange-100 transition">
              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Payment review: {pendingBookings.length} deposit(s) to confirm</span>
              </div>
              <span className="text-xs font-bold text-orange-600 uppercase">Review</span>
            </Link>
          )}

          {conciergeRequests.length > 0 && (
            <Link href="/admin/requests" className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition">
              <div className="flex items-center gap-3">
                <Headset size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Concierge: {conciergeRequests.length} general request(s)</span>
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase">Review</span>
            </Link>
          )}
          
          {totalAlerts === 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-md">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">All caught up. No urgent tasks.</span>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-lg border border-[#E5DFD3] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5DFD3] bg-[#FAF7F0] flex justify-between items-center">
          <h2 className="font-bold text-[#1B4D3E]">Recent Enquiries</h2>
          <Link href="/admin/bookings" className="text-xs text-[#3D8B8B] hover:text-[#1B4D3E] font-medium underline">View All Bookings</Link>
        </div>
        <div className="divide-y divide-[#E5DFD3]">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Loading activity...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No new enquiries.</div>
          ) : (
            enquiries.slice(0, 5).map((enq) => {
              const hasDraft = enq.quotations && enq.quotations.length > 0;

              return (
                <div key={enq.id} className="p-4 flex items-center justify-between hover:bg-[#FAF7F0] transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${hasDraft ? 'bg-[#C9A961]/10 border-[#C9A961]' : 'bg-[#FAF7F0] border-[#E5DFD3]'}`}>
                      {hasDraft ? <FileText size={14} className="text-[#C9A961]" /> : <Mail size={14} className="text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1B4D3E] flex items-center gap-2">
                        {enq.customers?.full_name}
                        {hasDraft && <span className="text-[9px] bg-[#FAF7F0] text-[#C9A961] border border-[#E5DFD3] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Draft Auto-Generated</span>}
                      </div>
                      <div className="text-xs text-gray-500">{enq.customers?.email} · {new Date(enq.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Link 
                    href={`/admin/quote?id=${enq.id}`} 
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 transition ${hasDraft ? 'bg-[#C9A961] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white' : 'text-[#3D8B8B] hover:text-[#1B4D3E]'}`}
                  >
                    {hasDraft ? 'Review Draft Quote' : 'Create Quote'}
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}