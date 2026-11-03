"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { LayoutDashboard, Bell, Calendar, FileText, Send, Settings, LogOut, Building2, MapPin, Users } from 'lucide-react'

export default function PartnerRequests() {
  const router = useRouter()
  const pathname = usePathname()
  const [partner, setPartner] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initPage() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/partners/login'); return }

      // Get partner record
      const { data: partnerData } = await supabase.from('partners').select('*').eq('email', session.user.email).single()
      if (partnerData) {
        setPartner(partnerData)
        
        // Fetch their specific requests
        const { data: reqData } = await supabase
          .from('service_requests')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('created_at', { ascending: false })
        
        if (reqData) setRequests(reqData)
      }
      setLoading(false)
    }
    initPage()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/partners/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Partner Portal</div>
          <div className="font-serif text-xl">{partner?.company_name || 'Loading...'}</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/partners/dashboard" className={`flex items-center gap-3 transition ${pathname === '/partners/dashboard' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}><LayoutDashboard size={16} /> Overview</Link>
          <Link href="/partners/dashboard/requests" className={`flex items-center gap-3 transition ${pathname === '/partners/dashboard/requests' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}><Bell size={16} /> Service Requests</Link>
          <Link href="/partners/dashboard/bookings" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition"><Calendar size={16} /> My Bookings</Link>
          <Link href="/partners/dashboard/quotations" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition"><FileText size={16} /> Quotations</Link>
        </nav>
        <button onClick={handleSignOut} className="mt-8 flex items-center gap-2 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition"><LogOut size={14} /> Sign Out</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Incoming Service Requests</h1>
        
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500 shadow-sm border border-[#E5DFD3]">
            You have no new service requests at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(req => (
              <div key={req.id} className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-xl text-[#1B4D3E]">{req.service_type} Request</span>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>{req.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-[#C9A961]"/> {req.destination}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} className="text-[#C9A961]"/> {req.travel_date}</span>
                      <span className="flex items-center gap-1"><Users size={14} className="text-[#C9A961]"/> {req.party_size} Pax</span>
                    </div>
                  </div>
                  <button className="bg-[#1B4D3E] text-white px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A961] transition">
                    Submit Quotation
                  </button>
                </div>
                <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] text-sm text-gray-700">
                  <strong>Client Requirements:</strong><br/>
                  {req.details}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}