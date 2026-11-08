"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function PartnerQuotations() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/partners/login'); return }

        const { data: partner } = await supabase.from('partners').select('id').eq('email', session.user.email).single()
        
        if (partner) {
          const { data, error } = await supabase
            .from('partner_quotations')
            .select(`
              *,
              service_requests (
                destination,
                service_type,
                travel_date,
                status
              )
            `)
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false })
            
          if (data) setQuotations(data)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuotes()
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1B4D3E] animate-pulse">Loading quotations...</div>

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#1B4D3E]">My Quotations</h1>
        <p className="text-sm text-gray-500 mt-2">History of your submitted proposals and their current status.</p>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 shadow-sm border border-[#E5DFD3]">
          <FileText className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">No quotations submitted</h2>
          <p>Your submitted quotes will appear here for tracking.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {quotations.map((quote) => {
            const request = Array.isArray(quote.service_requests) ? quote.service_requests[0] : quote.service_requests;
            
            return (
              <div key={quote.id} className="bg-white p-6 shadow-sm border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-serif text-xl text-[#1B4D3E]">{request?.service_type} Request</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold ${
                      request?.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                      request?.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {request?.status === 'accepted' ? 'ACCEPTED' : request?.status === 'quoted' ? 'UNDER REVIEW' : 'PENDING'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{request?.destination} · Travel Date: {request?.travel_date}</div>
                  <div className="text-xs text-gray-500 italic">"{quote.inclusions}"</div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Quoted Rate</div>
                  <div className="text-2xl font-serif text-[#1B4D3E]">
                    {quote.currency === 'MUR' ? 'Rs ' : quote.currency === 'EUR' ? '€' : '$'}
                    {quote.net_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}