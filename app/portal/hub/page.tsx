"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { FileText, Map, CheckCircle, Clock, Download, ArrowRight } from 'lucide-react'

function HubContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  const [quote, setQuote] = useState<any>(null)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!quoteRef) return
    async function fetchData() {
      const { data: quoteData } = await supabase
        .from('quotations')
        .select(`*, enquiries ( travel_start, customers (full_name) )`)
        .eq('booking_ref', quoteRef)
        .single()
      
      if (quoteData) {
        setQuote(quoteData)
        
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*')
          .eq('quotation_id', quoteData.id)
          .maybeSingle()

        if (bookingData) setBooking(bookingData)
      }
      setLoading(false)
    }
    fetchData()
  }, [quoteRef])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading your private portal...</div>
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-red-600">Link invalid or expired.</div>

  const clientName = quote.enquiries?.customers?.full_name || 'Valued Client'
  const travelStart = quote.enquiries?.travel_start ? new Date(quote.enquiries.travel_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To be confirmed'

  const isAccepted = !!booking
  const isDepositPaid = booking?.payment_status === 'Partially Paid' || booking?.payment_status === 'Paid'
  const isFullyPaid = booking?.payment_status === 'Paid'

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* PERSONALIZED HEADER */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Welcome, {clientName.split(' ')[0]}</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] mb-2">Your Private Travel Portal</p>
          <div className="text-sm text-gray-600 flex justify-center gap-4">
            <span>Ref: <strong className="text-[#1B4D3E]">{quote.booking_ref}</strong></span>
            <span>|</span>
            <span>Departure: <strong className="text-[#1B4D3E]">{travelStart}</strong></span>
          </div>
        </div>

        {/* STATUS TRACKER */}
        <div className="bg-white p-6 shadow-sm border border-[#E5DFD3] mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            
            <div className="flex flex-col items-center bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center mb-2"><CheckCircle size={16}/></div>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium">Quoted</span>
            </div>
            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isAccepted ? 'bg-[#1B4D3E] text-white' : 'bg-gray-200 text-gray-400'}`}><CheckCircle size={16}/></div>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium">Accepted</span>
            </div>
            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isDepositPaid ? 'bg-[#1B4D3E] text-white' : 'bg-gray-200 text-gray-400'}`}><CheckCircle size={16}/></div>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium">Deposit Paid</span>
            </div>
            <div className="flex flex-col items-center bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isFullyPaid ? 'bg-[#C9A961] text-white' : 'bg-gray-200 text-gray-400'}`}><CheckCircle size={16}/></div>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium">Fully Paid</span>
            </div>
          </div>
        </div>

        {/* DOCUMENTS LIST */}
        <div className="bg-white shadow-sm border border-[#E5DFD3]">
          <div className="p-6 border-b border-[#E5DFD3] bg-[#FAF7F0] flex justify-between items-end">
            <h2 className="font-serif text-2xl text-[#1B4D3E]">Your Travel Documents</h2>
            <span className="text-xs text-gray-500 italic">Confidential</span>
          </div>
          
          <div className="divide-y divide-[#E5DFD3]">
            
            {/* 1. The Quote */}
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-[#FAF7F0] transition">
              <div className="flex items-center gap-4">
                <FileText className="text-[#C9A961]" size={24} />
                <div>
                  <h3 className="font-medium text-[#1B4D3E]">Proforma Invoice</h3>
                  <p className="text-xs text-gray-500">Your original proposal</p>
                </div>
              </div>
              <Link href={`/portal/quote?ref=${quoteRef}`} className="text-xs border border-[#1B4D3E] text-[#1B4D3E] px-4 py-2 uppercase tracking-widest hover:bg-[#1B4D3E] hover:text-white transition w-full md:w-auto text-center">
                View Quote
              </Link>
            </div>

            {/* 2. The Itinerary */}
            {isDepositPaid && (
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-[#FAF7F0] transition">
                <div className="flex items-center gap-4">
                  <Map className="text-[#C9A961]" size={24} />
                  <div>
                    <h3 className="font-medium text-[#1B4D3E]">Travel Itinerary & Vouchers</h3>
                    <p className="text-xs text-gray-500">Your confirmed schedule, map, and driver details</p>
                  </div>
                </div>
                <Link href={`/portal/itinerary?ref=${quoteRef}`} className="text-xs bg-[#1B4D3E] text-white px-4 py-2 uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition w-full md:w-auto text-center">
                  View Itinerary
                </Link>
              </div>
            )}

            {/* 3. The Invoice */}
            {isFullyPaid && (
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-[#FAF7F0] transition">
                <div className="flex items-center gap-4">
                  <Download className="text-[#C9A961]" size={24} />
                  <div>
                    <h3 className="font-medium text-[#1B4D3E]">Final Tax Invoice</h3>
                    <p className="text-xs text-gray-500">Your official receipt for the trip</p>
                  </div>
                </div>
                <button onClick={() => window.print()} className="text-xs border border-[#1B4D3E] text-[#1B4D3E] px-4 py-2 uppercase tracking-widest hover:bg-[#1B4D3E] hover:text-white transition w-full md:w-auto text-center">
                  Print Invoice
                </button>
              </div>
            )}

            {/* 4. Pending Actions */}
            {!isAccepted && (
              <div className="p-6 bg-[#F5F0E6] flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-[#1B4D3E]">Action Required</h3>
                  <p className="text-xs text-gray-500">Please review and accept your quote to proceed.</p>
                </div>
                <Link href={`/portal/quote?ref=${quoteRef}`} className="bg-[#C9A961] text-[#1B4D3E] px-6 py-2 text-xs uppercase tracking-widest hover:bg-white transition flex items-center gap-2">
                  Review Now <ArrowRight size={14} />
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default function PortalHub() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HubContent />
    </Suspense>
  )
}