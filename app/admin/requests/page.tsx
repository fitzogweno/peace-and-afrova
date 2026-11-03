"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Send, MapPin, Users, Calendar, FileText } from 'lucide-react'

export default function AdminRequests() {
  const router = useRouter()
  const pathname = usePathname()
  const [partners, setPartners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [partnerId, setPartnerId] = useState('')
  const [destination, setDestination] = useState('Mauritius')
  const [serviceType, setServiceType] = useState('Transfer')
  const [travelDate, setTravelDate] = useState('')
  const [partySize, setPartySize] = useState('2')
  const [details, setDetails] = useState('')

  useEffect(() => {
    async function initPage() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      // Fetch active partners for the dropdown
      const { data: pData } = await supabase.from('partners').select('*').eq('status', 'active')
      if (pData) setPartners(pData)

      // Fetch existing requests
      const { data: rData } = await supabase.from('service_requests').select('*, partners(company_name)').order('created_at', { ascending: false })
      if (rData) setRequests(rData)

      setLoading(false)
    }
    initPage()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!partnerId) return alert("Please select a partner.")
    
    setIsSubmitting(true)
    const { error } = await supabase.from('service_requests').insert({
      partner_id: partnerId,
      destination,
      service_type: serviceType,
      travel_date: travelDate,
      party_size: parseInt(partySize),
      details
    })

    if (error) {
      alert("Failed to send request: " + error.message)
    } else {
      alert("Service request sent to partner successfully!")
      window.location.reload()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className={`block transition ${pathname === '/admin' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Dashboard</Link>
          <Link href="/admin/requests" className={`block transition ${pathname === '/admin/requests' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Service Requests</Link>
          <Link href="/admin/partners" className={`block transition ${pathname === '/admin/partners' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Partner Network</Link>
          <Link href="/admin/bookings" className={`block transition ${pathname === '/admin/bookings' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Operations & Bookings</Link>
        </nav>
        <button onClick={handleSignOut} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">Sign Out</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Service Requests</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* CREATE REQUEST FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm border border-[#E5DFD3] sticky top-8">
              <h2 className="font-serif text-2xl text-[#1B4D3E] mb-6">Send New Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Assign to Partner *</label>
                  <select required value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="">Select partner...</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.company_name} ({p.partner_type})</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Destination</label>
                    <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]">
                      <option value="Mauritius">Mauritius</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Reunion">Réunion</option>
                      <option value="Rodrigues">Rodrigues</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Service Type</label>
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]">
                      <option value="Transfer">Transfer</option>
                      <option value="Excursion">Excursion</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Dining">Dining</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Travel Date</label>
                    <input type="date" required value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Pax</label>
                    <input type="number" min="1" required value={partySize} onChange={(e) => setPartySize(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Requirements / Details</label>
                  <textarea required rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g., 2 VIP airport transfers from SSR to Le Morne. 4 large suitcases." className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition flex items-center justify-center gap-2">
                  <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>

          {/* EXISTING REQUESTS LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
              <div className="p-4 bg-[#FAF7F0] border-b border-[#E5DFD3] font-serif text-lg text-[#1B4D3E]">Recent Requests Sent</div>
              <div className="divide-y divide-[#E5DFD3]">
                {loading ? <p className="p-6">Loading...</p> : requests.length === 0 ? <p className="p-6 text-gray-500">No requests sent yet.</p> : requests.map(req => (
                  <div key={req.id} className="p-6 hover:bg-[#FAF7F0] transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-[#1B4D3E]">{req.partners?.company_name}</div>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm font-bold ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        req.status === 'quoted' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={12}/> {req.destination}</span>
                      <span className="flex items-center gap-1"><Calendar size={12}/> {req.travel_date}</span>
                      <span className="flex items-center gap-1"><Users size={12}/> {req.party_size} Pax</span>
                      <span className="flex items-center gap-1"><FileText size={12}/> {req.service_type}</span>
                    </div>
                    <p className="text-sm text-gray-700 italic border-l-2 border-[#C9A961] pl-3">"{req.details}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}