"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Send, MapPin, Users, Calendar, FileText, CheckCircle, ThumbsUp, Sparkles, Headset, X } from 'lucide-react'

export default function AdminRequests() {
  const router = useRouter()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'clients' | 'partners'>('clients')

  // --- PARTNER STATE ---
  const [partners, setPartners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAccepting, setIsAccepting] = useState<string | null>(null)

  const [partnerId, setPartnerId] = useState('')
  const [destination, setDestination] = useState('Mauritius')
  const [serviceType, setServiceType] = useState('Transfer')
  const [travelDate, setTravelDate] = useState('')
  const [partySize, setPartySize] = useState('2')
  const [details, setDetails] = useState('')

  // --- CLIENT UPSELL STATE ---
  const [clientRequests, setClientRequests] = useState<any[]>([])
  const [selectedClientReq, setSelectedClientReq] = useState<any>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [adminResponse, setAdminResponse] = useState('')
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initPage() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      // 1. Fetch Partners (for B2B requests)
      const { data: pData } = await supabase.from('partners').select('*').eq('status', 'active')
      if (pData) setPartners(pData)

      // 2. Fetch Partner Service Requests
      const { data: rData } = await supabase
        .from('service_requests')
        .select('*, partners(company_name), partner_quotations(*)')
        .order('created_at', { ascending: false })
      if (rData) setRequests(rData)

      // 3. Fetch Client Upsell/Concierge Requests
      const { data: cData } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (cData) setClientRequests(cData)

      setLoading(false)
    }
    initPage()
  }, [router])

  // --- PARTNER ACTIONS ---
  async function handleSubmitPartnerRequest(e: React.FormEvent) {
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

  async function handleAcceptPartnerQuote(req: any) {
    if (!confirm("Are you sure you want to accept this quote? This will create an operational booking.")) return
    setIsAccepting(req.id)

    try {
      const quote = req.partner_quotations[0]
      const res = await fetch('/api/requests/accept-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: req.id,
          quoteId: quote.id,
          partnerId: req.partner_id,
          serviceDescription: `${req.service_type} - ${req.destination}`,
          travelDate: req.travel_date
        })
      })

      if (res.ok) {
        alert("Quote accepted! The job has been added to the Dispatch Board.")
        window.location.reload()
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (err) {
      alert("Error accepting quote.")
    } finally {
      setIsAccepting(null)
    }
  }

  // --- CLIENT ACTIONS ---
  async function handleSendClientQuote(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClientReq) return
    setIsSubmittingQuote(true)

    await supabase
      .from('concierge_requests')
      .update({
        status: 'quoted',
        quoted_price: Number(quotePrice),
        admin_response: adminResponse,
        responded_at: new Date().toISOString()
      })
      .eq('id', selectedClientReq.id)

    setClientRequests(prev => prev.filter(r => r.id !== selectedClientReq.id))
    setIsSubmittingQuote(false)
    setSelectedClientReq(null)
    setQuotePrice('')
    setAdminResponse('')
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading requests...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* HEADER & TABS */}
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-6">Requests Hub</h1>
        
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition border-b-2 ${activeTab === 'clients' ? 'border-[#C9A961] text-[#1B4D3E]' : 'border-transparent text-gray-500 hover:text-[#1B4D3E]'}`}
          >
            <Sparkles size={18} /> Client Upsells & Concierge
            {clientRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{clientRequests.length}</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('partners')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition border-b-2 ${activeTab === 'partners' ? 'border-[#C9A961] text-[#1B4D3E]' : 'border-transparent text-gray-500 hover:text-[#1B4D3E]'}`}
          >
            <Send size={18} /> Partner Requests
          </button>
        </div>
      </div>

      {/* --- TAB 1: CLIENT UPSELLS --- */}
      {activeTab === 'clients' && (
        <div className="space-y-4 animate-in fade-in">
          {clientRequests.length === 0 ? (
            <div className="bg-white p-12 text-center border border-[#E5DFD3] rounded-lg shadow-sm">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="font-serif text-2xl text-[#1B4D3E]">Inbox Zero</h3>
              <p className="text-gray-500 mt-2">There are no pending concierge or upsell requests from clients.</p>
            </div>
          ) : (
            clientRequests.map((req) => (
              <div key={req.id} className="bg-white border border-[#E5DFD3] shadow-sm p-6 flex flex-col md:flex-row justify-between items-start gap-4 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-sm">
                      Pending
                    </span>
                    <span className="text-xs tracking-widest uppercase text-gray-500 flex items-center gap-1">
                      {req.is_upsell ? <Sparkles size={12} className="text-[#C9A961]"/> : <Headset size={12}/>}
                      {req.is_upsell ? 'Upsell' : 'Concierge'}
                    </span>
                    <span className="text-xs tracking-widest uppercase text-gray-500">Ref: {req.booking_ref}</span>
                  </div>
                  <h3 className="font-serif text-xl text-[#1B4D3E]">{req.category || req.request_type}</h3>
                  <p className="text-sm text-gray-600 mt-1">{req.request_details}</p>
                </div>
                
                <button 
                  onClick={() => setSelectedClientReq(req)}
                  className="bg-[#1B4D3E] text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition w-full md:w-auto mt-4 md:mt-0 whitespace-nowrap rounded-sm"
                >
                  Send Quote / Reply
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: PARTNER REQUESTS --- */}
      {activeTab === 'partners' && (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in">
          {/* CREATE REQUEST FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm border border-[#E5DFD3] sticky top-8">
              <h2 className="font-serif text-2xl text-[#1B4D3E] mb-6">Send New Request</h2>
              <form onSubmit={handleSubmitPartnerRequest} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Assign to Partner *</label>
                  <select required value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="">Select partner...</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
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
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Requirements</label>
                  <textarea required rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g., 2 VIP airport transfers..." className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition flex items-center justify-center gap-2">
                  <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>

          {/* EXISTING PARTNER REQUESTS LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
              <div className="p-4 bg-[#FAF7F0] border-b border-[#E5DFD3] font-serif text-lg text-[#1B4D3E]">Recent Partner Requests</div>
              <div className="divide-y divide-[#E5DFD3]">
                {requests.length === 0 ? <p className="p-6 text-gray-500">No requests sent yet.</p> : requests.map(req => (
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
                    <p className="text-sm text-gray-700 italic border-l-2 border-[#C9A961] pl-3 mb-4">"{req.details}"</p>
                    
                    {/* QUOTATION RECEIVED & ACCEPT BUTTON */}
                    {req.partner_quotations && req.partner_quotations.length > 0 && (
                      <div className="mt-4 bg-green-50 border border-green-200 p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
                          <div>
                            <div className="text-xs font-bold text-green-800 uppercase tracking-widest flex items-center gap-2 mb-1">
                              <CheckCircle size={14} /> Quotation Received
                            </div>
                            <div className="font-serif text-2xl text-green-800">
                              {req.partner_quotations[0].currency === 'MUR' ? 'Rs ' : req.partner_quotations[0].currency === 'EUR' ? '€' : '$'} 
                              {req.partner_quotations[0].net_amount.toLocaleString()}
                            </div>
                          </div>
                          
                          {req.status !== 'accepted' && (
                            <button 
                              onClick={() => handleAcceptPartnerQuote(req)}
                              disabled={isAccepting === req.id}
                              className="bg-green-600 text-white px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                              <ThumbsUp size={14} /> {isAccepting === req.id ? 'Accepting...' : 'Accept Quote'}
                            </button>
                          )}
                        </div>
                        
                        {req.partner_quotations[0].inclusions && (
                          <p className="text-sm text-gray-700 mt-2"><strong>Inclusions:</strong> {req.partner_quotations[0].inclusions}</p>
                        )}
                        {req.status === 'accepted' && (
                          <div className="mt-3 text-xs text-green-700 font-bold bg-green-100 p-2 border border-green-200 inline-block">
                            ✓ This quote has been accepted and is now on the Dispatch Board.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT QUOTE MODAL */}
      {selectedClientReq && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-md p-8 shadow-2xl relative rounded-lg">
            <button onClick={() => setSelectedClientReq(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Quote Request</h3>
            <p className="text-sm text-gray-500 mb-6">Provide pricing for: <strong className="text-[#1B4D3E]">{selectedClientReq.category || selectedClientReq.request_type}</strong></p>

            <form onSubmit={handleSendClientQuote} className="space-y-4">
              {selectedClientReq.is_upsell && (
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Price (MUR)</label>
                  <input 
                    required 
                    type="number" 
                    value={quotePrice} 
                    onChange={(e) => setQuotePrice(e.target.value)} 
                    placeholder="e.g., 5000" 
                    className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" 
                  />
                </div>
              )}
              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Message to Client</label>
                <textarea 
                  value={adminResponse} 
                  onChange={(e) => setAdminResponse(e.target.value)} 
                  rows={3} 
                  placeholder="e.g., We have arranged this for you. Includes private transfer." 
                  className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]"
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmittingQuote} className="flex-1 bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50">
                  {isSubmittingQuote ? 'Sending...' : 'Send to Client'}
                </button>
                <button type="button" onClick={() => setSelectedClientReq(null)} className="flex-1 border border-[#1B4D3E] text-[#1B4D3E] py-3 text-xs uppercase tracking-widest hover:bg-white transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}