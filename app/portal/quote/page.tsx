"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Handshake, AlertCircle, ShieldCheck } from 'lucide-react'

function PortalContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  const [showAmendment, setShowAmendment] = useState(false)
  const [targetBudget, setTargetBudget] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('Keep as is, but adjust price')
  const [amendmentMessage, setAmendmentMessage] = useState('')
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState(false)

  useEffect(() => {
    if (!quoteRef) return
    async function fetchQuote() {
      // UPDATED: Fetching the service_credit from the linked bookings table
      const { data } = await supabase
        .from('quotations')
        .select(`*, enquiries ( customers (full_name) ), bookings ( service_credit )`)
        .eq('booking_ref', quoteRef)
        .single()
      
      if (data) setQuote(data)
      setLoading(false)
    }
    fetchQuote()
  }, [quoteRef])

  const formatQuotePrice = (amountInMUR: number) => {
    const curr = quote?.currency || 'MUR'
    if (curr === 'MUR') return `Rs ${amountInMUR.toLocaleString()}`
    const rate = curr === 'USD' ? 45 : curr === 'EUR' ? 49 : 1
    const converted = amountInMUR / rate
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(converted)
  }

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
          totalAmount: adjustedTotal // Pass the adjusted total
        })
      })
      const data = await res.json()
      if (data.success) setPaymentData(data)
      else alert(`Failed: ${data.error || 'Unknown error'}`)
    } catch (err) {
      alert("Error processing request.")
    } finally {
      setIsAccepting(false)
    }
  }

  async function handleAmendment(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmittingOffer(true)
    try {
      const res = await fetch('/api/send-amendment', {
        method: 'POST',
        body: JSON.stringify({
          quoteRef: quote.booking_ref,
          clientName: quote.enquiries?.customers?.full_name,
          targetBudget: targetBudget,
          adjustmentType: adjustmentType,
          message: amendmentMessage
        })
      })
      if (res.ok) setOfferSuccess(true)
    } catch (err) {}
    setIsSubmittingOffer(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading your proposal...</div>
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-red-600">Proposal not found. Please check your link.</div>

  // Safely extract the Service Credit (handling Supabase array returns)
  const bookingData = Array.isArray(quote.bookings) ? quote.bookings[0] : quote.bookings
  const serviceCredit = bookingData?.service_credit || 0

  // Calculate the Adjusted Total
  const originalTotal = quote.total
  const adjustedTotal = originalTotal - serviceCredit

  const departureDate = quote.travel_start ? new Date(quote.travel_start) : new Date()
  const balanceDueDate = new Date(departureDate)
  balanceDueDate.setDate(balanceDueDate.getDate() - 7)
  const formattedBalanceDate = balanceDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

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
            <div className="text-2xl font-serif text-[#1B4D3E]">{formatQuotePrice(adjustedTotal)}</div>
          </div>
        </div>

        {/* --- NEW: SERVICE GUARANTEE BANNER --- */}
        {serviceCredit > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 mb-8 flex items-start gap-3 rounded-sm animate-in fade-in slide-in-from-top-4">
            <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h4 className="font-bold text-green-800 text-sm">Service Guarantee Applied</h4>
              <p className="text-sm text-green-700">
                We noticed your driver was delayed. As part of our Swiss Precision promise, we have automatically applied a credit of <strong>{formatQuotePrice(serviceCredit)}</strong> to your invoice.
              </p>
            </div>
          </div>
        )}

        {!paymentData && !showAmendment && !offerSuccess && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
            <button onClick={handleAccept} disabled={isAccepting} className="bg-[#1B4D3E] text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition disabled:opacity-50">
              {isAccepting ? 'PROCESSING...' : 'ACCEPT & PAY DEPOSIT'}
            </button>
            <button onClick={() => setShowAmendment(true)} className="border border-[#1B4D3E] text-[#1B4D3E] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#FAF7F0] transition flex items-center justify-center gap-2">
              <Handshake size={18} /> Tailor This Proposal
            </button>
          </div>
        )}

        {paymentData && (
          <div className="mt-8 bg-white border border-[#C9A961] p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] mb-2">Proposal Accepted</div>
              <h3 className="font-serif text-2xl text-[#1B4D3E]">Deposit Required</h3>
            </div>
            
            <div className="bg-[#FAF7F0] p-6 mb-6">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E5DFD3]">
                <span className="text-sm text-gray-600">Original Total</span>
                <span className="font-medium text-[#1B4D3E]">{formatQuotePrice(originalTotal)}</span>
              </div>

              {serviceCredit > 0 && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E5DFD3] text-green-700">
                  <span className="text-sm font-medium">Service Guarantee Credit</span>
                  <span className="font-medium">- {formatQuotePrice(serviceCredit)}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E5DFD3]">
                <span className="text-sm font-medium text-[#1B4D3E]">Adjusted Total</span>
                <span className="font-medium text-[#1B4D3E]">{formatQuotePrice(adjustedTotal)}</span>
              </div>

              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E5DFD3]">
                <span className="text-sm font-medium text-[#1B4D3E]">Deposit Due Now (30%)</span>
                <span className="text-xl font-serif text-[#1B4D3E]">{formatQuotePrice(paymentData.depositAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div>
                  <span className="text-sm font-medium text-[#1B4D3E]">Final Balance</span>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Due 7 days before departure ({formattedBalanceDate})
                  </p>
                </div>
                <span className="text-xl font-serif text-[#1B4D3E]">{formatQuotePrice(adjustedTotal - paymentData.depositAmount)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-3 font-medium">Payment Instructions</h4>
              <ul className="text-sm text-gray-700 space-y-1 bg-[#FAF7F0] p-4">
                <li><strong>Bank:</strong> [Your Bank Name - MCB / SBM]</li>
                <li><strong>Account Name:</strong> Peace and Afrova Group Ltd</li>
                <li><strong>Reference:</strong> {quote.booking_ref}</li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E5DFD3]">
              <Link href={`/portal/hub?ref=${quote.booking_ref}`} className="inline-block w-full text-center bg-[#1B4D3E] text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
                Go to Your Private Dashboard
              </Link>
            </div>
          </div>
        )}

        {showAmendment && !offerSuccess && (
          <div className="mt-12 bg-[#FAF7F0] border border-[#C9A961] p-6 md:p-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Tailor This Proposal</h3>
            <p className="text-sm text-gray-600 mb-6">If you'd like to adjust this itinerary to align with your budget or preferences, please let our concierge know below.</p>
            
            <form onSubmit={handleAmendment}>
              
              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Target Budget (Optional)</label>
                <input 
                  type="text" 
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="e.g., €2,500 or Rs 125,000" 
                  className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961] bg-white" 
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">What would you like to adjust?</label>
                <select 
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961] bg-white"
                >
                  <option value="Keep as is, but adjust price">Keep as is, but adjust price</option>
                  <option value="Change hotel / accommodation">Change hotel / accommodation</option>
                  <option value="Upgrade or downgrade transport">Upgrade or downgrade transport</option>
                  <option value="Swap or remove an activity">Swap or remove an activity</option>
                  <option value="Something else">Something else</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Message / Requested Changes</label>
                <textarea 
                  required 
                  value={amendmentMessage} 
                  onChange={(e) => setAmendmentMessage(e.target.value)} 
                  placeholder="E.g., We want to keep the private helicopter, but are open to a different hotel to bring the total to €3,000." 
                  className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961] bg-white" 
                  rows={4} 
                />
              </div>
              
              <div className="flex gap-4 border-t border-[#E5DFD3] pt-6">
                <button type="submit" disabled={isSubmittingOffer} className="bg-[#1B4D3E] text-white px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50">
                  {isSubmittingOffer ? 'Sending...' : 'Submit Request'}
                </button>
                <button type="button" onClick={() => setShowAmendment(false)} className="text-gray-500 text-sm hover:text-gray-800 uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {offerSuccess && (
          <div className="mt-12 bg-green-50 border border-green-200 p-8 text-center">
            <h3 className="font-serif text-2xl text-green-800 mb-2">Request Received</h3>
            <p className="text-sm text-green-700">Thank you. Our concierge has been notified and will review your custom request shortly.</p>
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