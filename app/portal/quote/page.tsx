"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'

function PortalContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  const [quote, setQuote] = useState<any>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isPayingBalance, setIsPayingBalance] = useState(false)

  // Amendment State
  const [showAmendment, setShowAmendment] = useState(false)
  const [amendmentMessage, setAmendmentMessage] = useState('')
  const [requestedPercent, setRequestedPercent] = useState<number>(100)
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState(false)

  useEffect(() => {
    if (!quoteRef) return
    
    async function fetchData() {
      const { data: quoteData } = await supabase
        .from('quotations')
        .select(`*, enquiries ( customers (full_name) )`)
        .eq('booking_ref', quoteRef)
        .single()
      
      if (quoteData) {
        setQuote(quoteData)

        const { data: bData } = await supabase
          .from('bookings')
          .select('*')
          .eq('quotation_id', quoteData.id)
          .maybeSingle()

        if (bData) setBookingData(bData)
      }
      setLoading(false)
    }
    fetchData()
  }, [quoteRef])

  async function handleAccept() {
    setIsAccepting(true)
    try {
      const res = await fetch('/api/accept-quote', {
        method: 'POST',
        body: JSON.stringify({
          quoteId: quote.id,
          bookingRef: quote.booking_ref,
          customerName: quote.enquiries?.customers?.full_name,
          travelStart: quote.travel_start,
          totalAmount: quote.total
        })
      })
      const data = await res.json()
      if (data.success) {
        // Update local booking data to reflect deposit payment
        setBookingData({ ...bookingData, payment_status: 'Partially Paid', total_amount: quote.total })
      }
    } catch (err) {
      alert("Error processing request.")
    }
    setIsAccepting(false)
  }

  async function handlePayBalance() {
    setIsPayingBalance(true)
    try {
      const res = await fetch('/api/pay-balance', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: bookingData.id,
          bookingRef: quote.booking_ref
        })
      })
      const data = await res.json()
      if (data.success) {
        alert("Balance payment link generated! (Gateway coming soon)")
        setBookingData({ ...bookingData, payment_status: 'Paid' })
      }
    } catch (err) {
      alert("Error generating payment link.")
    }
    setIsPayingBalance(false)
  }

  async function handleAmendment(e: React.FormEvent) {
    e.preventDefault()
    if (requestedPercent < 90) {
      alert("We cannot accept an offer below 90% of the total price.")
      return
    }

    setIsSubmittingOffer(true)
    try {
      const res = await fetch('/api/send-amendment', {
        method: 'POST',
        body: JSON.stringify({
          quoteRef: quote.booking_ref,
          clientName: quote.enquiries?.customers?.full_name,
          message: amendmentMessage,
          requestedPercent: requestedPercent
        })
      })
      if (res.ok) setOfferSuccess(true)
    } catch (err) {}
    setIsSubmittingOffer(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading your proposal...</div>
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-red-600">Proposal not found. Please check your link.</div>

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 md:p-12">
        
        <div className="text-center border-b border-[#E5DFD3] pb-8 mb-8">
          <h1 className="font-serif text-4xl text-[#1B4D3E] mb-2">Peace and Afrova</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B]">Private Travel Proposal</p>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E5DFD3] p-6 mb-8 flex justify-between items-center">
          <div>
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Reference</div>
            <div className="font-medium text-[#1B4D3E]">{quote.booking_ref}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Travel Date</div>
            <div className="font-medium text-[#1B4D3E]">{quote.travel_start}</div>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-1">Total (Incl. VAT)</div>
            <div className="text-2xl font-serif text-[#1B4D3E]">Rs {quote.total.toLocaleString()}</div>
          </div>
        </div>

        {/* STATE 1: NOT ACCEPTED YET */}
        {!bookingData && !showAmendment && !offerSuccess && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
            <button onClick={handleAccept} disabled={isAccepting} className="bg-[#1B4D3E] text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition disabled:opacity-50">
              {isAccepting ? 'Processing...' : 'Accept & Pay Deposit'}
            </button>
            <button onClick={() => setShowAmendment(true)} className="border border-[#1B4D3E] text-[#1B4D3E] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#FAF7F0] transition">
              Request Amendment
            </button>
          </div>
        )}

        {/* STATE 2: DEPOSIT PAID, BALANCE DUE */}
        {bookingData?.payment_status === 'Partially Paid' && (
          <div className="mt-8 bg-white border border-[#C9A961] p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] mb-2">Deposit Received</div>
              <h3 className="font-serif text-2xl text-[#1B4D3E]">Balance Due Before Travel</h3>
            </div>
            
            <div className="bg-[#FAF7F0] p-6 mb-6">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E5DFD3]">
                <span className="text-sm text-gray-600">Total Trip Cost</span>
                <span className="font-medium text-[#1B4D3E]">Rs {quote.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Deposit Paid (50%)</span>
                <span className="font-medium text-green-700">- Rs {(quote.total * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E5DFD3]">
                <span className="text-sm font-medium text-[#1B4D3E]">Remaining Balance</span>
                <span className="text-xl font-serif text-[#1B4D3E]">Rs {(quote.total * 0.5).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handlePayBalance} 
              disabled={isPayingBalance}
              className="bg-[#C9A961] text-[#1B4D3E] px-8 py-4 text-sm tracking-widest uppercase w-full hover:bg-[#b09552] transition disabled:opacity-50"
            >
              {isPayingBalance ? 'Generating Link...' : 'Pay Remaining Balance'}
            </button>

            <div className="mt-6 text-center border-t border-[#E5DFD3] pt-6">
              <a href={`/portal/itinerary?ref=${quote.booking_ref}`} target="_blank" className="text-[#3D8B8B] font-medium hover:text-[#1B4D3E] underline">
                View Your Full Itinerary & Vouchers
              </a>
            </div>
          </div>
        )}

        {/* STATE 3: FULLY PAID */}
        {bookingData?.payment_status === 'Paid' && (
          <div className="mt-8 bg-green-50 border border-green-200 p-8 text-center">
            <h3 className="font-serif text-2xl text-green-800 mb-2">Fully Paid</h3>
            <p className="text-sm text-green-700 mb-6">Your balance has been settled. We look forward to welcoming you to Mauritius.</p>
            <a href={`/portal/itinerary?ref=${quote.booking_ref}`} target="_blank" className="inline-block bg-[#1B4D3E] text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A961] transition">
              View Itinerary & Vouchers
            </a>
          </div>
        )}

        {/* AMENDMENT FORM */}
        {showAmendment && !offerSuccess && (
          <div className="mt-12 bg-[#FAF7F0] border border-[#C9A961] p-6 md:p-8">
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Request an Amendment</h3>
            <p className="text-sm text-gray-600 mb-6">Tell us what you would like to change. If you are also requesting a discount, adjust the slider below.</p>
            <form onSubmit={handleAmendment}>
              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Your Request</label>
                <textarea required value={amendmentMessage} onChange={(e) => setAmendmentMessage(e.target.value)} placeholder="Please describe the changes..." className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" rows={4} />
              </div>
              <div className="mb-8 border-t border-[#E5DFD3] pt-6">
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Discount Request (Optional)</label>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#1B4D3E]">Target Price:</span>
                  <span className="text-xl font-serif text-[#1B4D3E]">Rs {((quote.total * requestedPercent) / 100).toLocaleString()} ({requestedPercent}%)</span>
                </div>
                <input type="range" min="90" max="100" value={requestedPercent} onChange={(e) => setRequestedPercent(Number(e.target.value))} className="w-full accent-[#C9A961]" />
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Min (90%)</span><span>Full Price (100%)</span></div>
              </div>
              <div className="flex gap-4 border-t border-[#E5DFD3] pt-6">
                <button type="submit" disabled={isSubmittingOffer} className="bg-[#C9A961] text-[#1B4D3E] px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-[#b09552] transition disabled:opacity-50">{isSubmittingOffer ? 'Sending...' : 'Submit Amendment'}</button>
                <button type="button" onClick={() => setShowAmendment(false)} className="text-gray-500 text-sm hover:text-gray-800 uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {offerSuccess && (
          <div className="mt-12 bg-green-50 border border-green-200 p-8 text-center">
            <h3 className="font-serif text-2xl text-green-800 mb-2">Request Received</h3>
            <p className="text-sm text-green-700">Thank you. Our team has been notified.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ClientPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading Portal...</div>}>
      <PortalContent />
    </Suspense>
  )
}