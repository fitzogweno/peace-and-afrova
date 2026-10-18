"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function ClientPortal() {
  const params = useParams()
  const quoteRef = params.ref as string

  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Bargain State
  const [showBargain, setShowBargain] = useState(false)
  const [bargainMessage, setBargainMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bargainSuccess, setBargainSuccess] = useState(false)

  useEffect(() => {
    async function fetchQuote() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Fetch the quote by its reference number
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          enquiries (
            customers (full_name)
          )
        `)
        .eq('booking_ref', quoteRef)
        .single()

      if (data) setQuote(data)
      setLoading(false)
    }
    fetchQuote()
  }, [quoteRef])

  async function handleBargain(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    
    // In a real app, this would save to a database table called 'bargains'
    // For now, we simulate a delay and show success.
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setBargainSuccess(true)
    setIsSubmitting(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading your proposal...</div>
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-red-600">Proposal not found. Please check your link.</div>

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 md:p-12">
        
        {/* HEADER */}
        <div className="text-center border-b border-[#E5DFD3] pb-8 mb-8">
          <h1 className="font-serif text-4xl text-[#1B4D3E] mb-2">Peace and Afrova</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B]">Private Travel Proposal</p>
        </div>

        <div className="mb-8">
          <p className="text-lg mb-2">Dear {quote.enquiries?.customers?.full_name || 'Valued Client'},</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Thank you for choosing Peace and Afrova. Below is your personalised proposal. 
            Please review the details and let us know how you would like to proceed.
          </p>
        </div>

        {/* QUOTE DETAILS */}
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

        {/* ACTION BUTTONS */}
        {!showBargain && !bargainSuccess && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
            <button className="bg-[#1B4D3E] text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition">
              Accept & Proceed to Payment
            </button>
            <button 
              onClick={() => setShowBargain(true)}
              className="border border-[#1B4D3E] text-[#1B4D3E] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#FAF7F0] transition"
            >
              Request Adjustment
            </button>
          </div>
        )}

        {/* BARGAIN FORM */}
        {showBargain && !bargainSuccess && (
          <div className="mt-12 bg-[#FAF7F0] border border-[#C9A961] p-6">
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4">Request an Adjustment</h3>
            <p className="text-sm text-gray-600 mb-6">
              We want to make this journey perfect for you. Tell us what you would like to adjust (e.g., budget, dates, inclusions). 
              <br/><br/>
              <em>* Please note: We can accommodate adjustments up to a maximum discount of 15% on the final total.</em>
            </p>
            <form onSubmit={handleBargain}>
              <textarea 
                required
                value={bargainMessage}
                onChange={(e) => setBargainMessage(e.target.value)}
                placeholder="I would like to request a 10% discount..."
                className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961] mb-4"
                rows={4}
              />
              <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className="bg-[#C9A961] text-[#1B4D3E] px-6 py-2 text-sm font-medium hover:bg-[#b09552] transition disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
                <button type="button" onClick={() => setShowBargain(false)} className="text-gray-500 text-sm hover:text-gray-800">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {bargainSuccess && (
          <div className="mt-12 bg-green-50 border border-green-200 p-8 text-center">
            <h3 className="font-serif text-2xl text-green-800 mb-2">Request Received</h3>
            <p className="text-sm text-green-700">
              Thank you. Our team will review your request and get back to you shortly with an updated proposal.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}