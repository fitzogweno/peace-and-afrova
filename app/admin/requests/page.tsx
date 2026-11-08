"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Send, MapPin, Users, Calendar, FileText, CheckCircle, ThumbsUp } from 'lucide-react'

export default function AdminRequests() {
  const router = useRouter()
  const [partners, setPartners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAccepting, setIsAccepting] = useState<string | null>(null)

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

      const { data: pData } = await supabase.from('partners').select('*').eq('status', 'active')
      if (pData) setPartners(pData)

      const { data: rData } = await supabase
        .from('service_requests')
        .select('*, partners(company_name), partner_quotations(*)')
        .order('created_at', { ascending: false })
        
      if (rData) setRequests(rData)

      setLoading(false)
    }
    initPage()
  }, [router])

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

  async function handleAcceptQuote(req: any) {
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

  return (
    <div className="max-w-7xl mx-auto">
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

        {/* EXISTING REQUESTS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
            <div className="p-4 bg-[#FAF7F0] border-b border-[#E5DFD3] font-serif text-lg text-[#1B4D3E]">Recent Requests</div>
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
                        
                        {/* ACCEPT QUOTE BUTTON */}
                        {req.status !== 'accepted' && (
                          <button 
                            onClick={() => handleAcceptQuote(req)}
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
    </div>
  )
}