"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { CheckCircle, XCircle, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminBrandingPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBranding() {
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, booking_ref, client_logo_url, client_brand_name, client_welcome_message,
          quotations ( enquiries ( customers ( full_name ) ) )
        `)
        .eq('branding_status', 'pending_approval')
      
      if (data) setRequests(data)
      setLoading(false)
    }
    fetchBranding()
  }, [])

  async function handleAction(bookingId: string, action: 'approved' | 'rejected') {
    await supabase.from('bookings').update({ branding_status: action }).eq('id', bookingId)
    setRequests(prev => prev.filter(req => req.id !== bookingId))
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading branding requests...</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
        <div>
          <Link href="/admin" className="text-xs text-[#3D8B8B] hover:text-[#1B4D3E] flex items-center gap-1 mb-2 font-medium">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-[#1B4D3E]">Branding Approvals</h1>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center border border-[#E5DFD3] rounded-lg shadow-sm">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="font-serif text-2xl text-[#1B4D3E]">All Caught Up</h3>
          <p className="text-gray-500 mt-2">There are no pending branding requests to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const customer = req.quotations?.enquiries?.customers?.full_name || 'Client'
            return (
              <div key={req.id} className="bg-white border border-[#E5DFD3] shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-lg">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-[#FAF7F0] border border-[#E5DFD3] flex items-center justify-center p-2 rounded-sm shrink-0">
                    <img src={req.client_logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Ref: {req.booking_ref} · {customer}</div>
                    <h3 className="font-serif text-xl text-[#1B4D3E] mb-1">{req.client_brand_name}</h3>
                    {req.client_welcome_message && (
                      <p className="text-sm text-gray-600 italic">"{req.client_welcome_message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                  <button onClick={() => handleAction(req.id, 'rejected')} className="flex-1 md:flex-none flex justify-center items-center gap-2 border border-red-200 text-red-600 px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-50 transition rounded-sm">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => handleAction(req.id, 'approved')} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-[#1B4D3E] text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition rounded-sm">
                    <Check size={16} /> Approve
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}