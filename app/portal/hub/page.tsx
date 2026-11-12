"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { FileText, Map, CheckCircle, Download, ArrowRight, ConciergeBell, X, Info, UserCheck, LogOut, Palette, UploadCloud } from 'lucide-react'

function HubContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quoteRef = searchParams.get('ref') || ''

  const [quote, setQuote] = useState<any>(null)
  const [booking, setBooking] = useState<any>(null)
  const [conciergeRequests, setConciergeRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Concierge State
  const [showConcierge, setShowConcierge] = useState(false)
  const [requestType, setRequestType] = useState('Restaurant Reservation')
  const [requestDetails, setRequestDetails] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  // Pre-Arrival Intake State
  const [showIntake, setShowIntake] = useState(false)
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false)

  // Branding State
  const [showBranding, setShowBranding] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false)
  const [brandSuccess, setBrandSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // 1. SECURE: Ensure the user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/portal/login')
        return
      }

      if (!quoteRef) { setLoading(false); return }

      // 2. Fetch Quote & Booking
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

        if (bookingData) {
          setBooking(bookingData)
          setBrandName(bookingData.client_brand_name || '')
          setWelcomeMsg(bookingData.client_welcome_message || '')
        }

        // 3. Fetch Client's Concierge/Upsell Requests
        const { data: reqs } = await supabase
          .from('concierge_requests')
          .select('*')
          .eq('booking_ref', quoteRef)
          .order('created_at', { ascending: false })
        
        if (reqs) setConciergeRequests(reqs)
      }
      setLoading(false)
    }
    fetchData()
  }, [quoteRef, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  async function handleConciergeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmittingRequest(true)
    
    const isUpsell = ['Private Chauffeur', 'Excursions & Tours', 'Fine Dining', 'Special Event'].includes(requestType)

    await fetch('/api/concierge-request', {
      method: 'POST',
      body: JSON.stringify({
        bookingRef: quote.booking_ref,
        customerName: quote.enquiries?.customers?.full_name || 'Valued Client',
        requestType: isUpsell ? `UPSell: ${requestType}` : requestType,
        requestDetails: requestDetails
      })
    })

    // Optimistically add to the list
    setConciergeRequests([{
      id: Date.now().toString(),
      category: requestType,
      request_details: requestDetails,
      status: 'pending',
      created_at: new Date().toISOString()
    }, ...conciergeRequests])

    setIsSubmittingRequest(false)
    setShowConcierge(false)
    setRequestDetails('')
  }

  async function acceptQuote(requestId: string) {
    await supabase
      .from('concierge_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
    
    // Update local state so UI reflects immediately
    setConciergeRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r)
    )
    // TODO: Trigger an email to admin that the client accepted the upsell
  }

  async function handleIntakeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmittingIntake(true)
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('bookings').update({
      intake_flight: formData.get('flight'),
      dietary_needs: formData.get('dietary'),
      special_occasion: formData.get('occasion'),
      car_seats: formData.get('carseats'),
      pace_preference: formData.get('pace'),
      intake_submitted: true
    }).eq('id', booking.id)

    setBooking({ ...booking, intake_submitted: true })
    setIsSubmittingIntake(false)
    setShowIntake(false)
  }

  async function handleBrandSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!booking) return
    setIsSubmittingBrand(true)
    setBrandSuccess(false)

    try {
      let logoUrl = booking.client_logo_url

      // Upload file to Supabase Storage if a new one is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${booking.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('client-logos').upload(fileName, logoFile)
        if (uploadError) throw uploadError
        
        const { data: publicUrl } = supabase.storage.from('client-logos').getPublicUrl(fileName)
        logoUrl = publicUrl.publicUrl
      }

      // Update database to 'pending_approval'
      await supabase.from('bookings').update({
        client_logo_url: logoUrl,
        client_brand_name: brandName,
        client_welcome_message: welcomeMsg,
        branding_status: 'pending_approval'
      }).eq('id', booking.id)

      setBrandSuccess(true)
      setBooking({ ...booking, client_logo_url: logoUrl, client_brand_name: brandName, client_welcome_message: welcomeMsg, branding_status: 'pending_approval' })
      setTimeout(() => setShowBranding(false), 3500)
    } catch (err) {
      alert("Failed to upload branding. Please try again.")
    } finally {
      setIsSubmittingBrand(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E] animate-pulse">Loading your private portal...</div>
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-red-600">Link invalid or expired.</div>

  const clientName = quote.enquiries?.customers?.full_name || 'Valued Client'
  const travelStart = quote.enquiries?.travel_start ? new Date(quote.enquiries.travel_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To be confirmed'

  const isAccepted = !!booking
  const isDepositPaid = booking?.payment_status === 'Partially Paid' || booking?.payment_status === 'Paid'
  const isFullyPaid = booking?.payment_status === 'Paid'

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* PERSONALIZED HEADER & CO-BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-[#E5DFD3] pb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Welcome, {clientName.split(' ')[0]}</h1>
            <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] mb-2">Your Private Travel Portal</p>
            <div className="text-sm text-gray-600 flex flex-wrap gap-4">
              <span>Ref: <strong className="text-[#1B4D3E]">{quote.booking_ref}</strong></span>
              <span>|</span>
              <span>Departure: <strong className="text-[#1B4D3E]">{travelStart}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 md:mt-0">
            {/* CO-BRANDING DISPLAY (Only shows if approved) */}
            {booking?.client_logo_url && booking?.branding_status === 'approved' && (
              <div className="flex items-center gap-4 animate-in fade-in">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] tracking-widest uppercase text-gray-400">Prepared for</div>
                  <div className="text-sm font-bold text-[#1B4D3E]">{booking.client_brand_name || 'VIP Guest'}</div>
                </div>
                <div className="h-10 w-px bg-[#E5DFD3] hidden md:block" />
                <img src={booking.client_logo_url} alt="Client Logo" className="h-12 w-auto object-contain max-w-[150px]" />
              </div>
            )}

            <button onClick={handleLogout} className="text-xs tracking-widest uppercase text-gray-500 hover:text-red-600 flex items-center gap-2">
              <LogOut size={16} /> Sign Out
            </button>
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

        {/* BRANDING WIDGET */}
        {isDepositPaid && (
          <div className="mb-8 bg-white border border-[#C9A961] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="bg-[#FAF7F0] p-3 rounded-full border border-[#E5DFD3]">
                <Palette className="text-[#C9A961]" size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#1B4D3E]">My Brand & Travel Experience</h3>
                <p className="text-sm text-gray-600">
                  {booking?.branding_status === 'pending_approval' 
                    ? "Your branding is currently under review by our operations team."
                    : booking?.branding_status === 'approved'
                    ? "Your custom branding is active. You can update it below."
                    : "Personalize your itinerary with your company logo or wedding monogram."}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowBranding(true)}
              className="bg-[#1B4D3E] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap"
            >
              Manage Branding
            </button>
          </div>
        )}

        {/* PRE-ARRIVAL INTAKE BANNER */}
        {isDepositPaid && !booking?.intake_submitted && (
          <div className="mb-8 bg-[#FAF7F0] border border-[#C9A961] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full border border-[#E5DFD3]">
                <UserCheck className="text-[#C9A961]" size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#1B4D3E]">Complete Your Pre-Arrival Profile</h3>
                <p className="text-sm text-gray-600">Help us prepare your villa, chauffeur, and special surprises before you land.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowIntake(true)}
              className="bg-[#1B4D3E] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap"
            >
              Fill Form
            </button>
          </div>
        )}

        {/* DOCUMENTS LIST */}
        <div className="bg-white shadow-sm border border-[#E5DFD3] mb-8">
          <div className="p-6 border-b border-[#E5DFD3] bg-[#FAF7F0] flex justify-between items-end">
            <h2 className="font-serif text-2xl text-[#1B4D3E]">Your Travel Documents</h2>
            <span className="text-xs text-gray-500 italic">Confidential</span>
          </div>
          
          <div className="divide-y divide-[#E5DFD3]">
            
            {/* 0. Welcome Pack */}
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-[#FAF7F0] transition">
              <div className="flex items-center gap-4">
                <Info className="text-[#C9A961]" size={24} />
                <div>
                  <h3 className="font-medium text-[#1B4D3E]">Destination Guide</h3>
                  <p className="text-xs text-gray-500">Emergency contacts, SIM advice, and local tips</p>
                </div>
              </div>
              <Link href={`/portal/welcome?ref=${quoteRef}`} className="text-xs border border-[#1B4D3E] text-[#1B4D3E] px-4 py-2 uppercase tracking-widest hover:bg-[#1B4D3E] hover:text-white transition w-full md:w-auto text-center">
                View Guide
              </Link>
            </div>

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

        {/* --- ACTIVE REQUESTS WIDGET --- */}
        {conciergeRequests.length > 0 && (
          <div className="bg-white shadow-sm border border-[#E5DFD3] mb-8">
            <div className="p-6 border-b border-[#E5DFD3] bg-[#FAF7F0] flex justify-between items-end">
              <h2 className="font-serif text-2xl text-[#1B4D3E]">Your Requests & Upgrades</h2>
            </div>
            <div className="divide-y divide-[#E5DFD3]">
              {conciergeRequests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-1">
                      {req.category || req.request_type}
                    </div>
                    <p className="text-sm text-[#1B4D3E] mb-2">{req.request_details}</p>
                    {req.status === 'quoted' && (
                      <div className="bg-[#FAF7F0] p-3 border border-[#C9A961] inline-block">
                        <p className="text-sm font-medium text-[#1B4D3E]">
                          Quote: <strong>Rs {req.quoted_price?.toLocaleString()}</strong>
                        </p>
                        {req.admin_response && <p className="text-xs text-gray-500">{req.admin_response}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 ${
                      req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      req.status === 'quoted' ? 'bg-[#C9A961]/20 text-[#1B4D3E]' :
                      req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.status}
                    </span>
                    {req.status === 'quoted' && (
                      <button
                        onClick={() => acceptQuote(req.id)}
                        className="bg-[#1B4D3E] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition"
                      >
                        Accept & Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONCIERGE REQUEST BUTTON */}
        {isDepositPaid && (
          <div className="mt-8 bg-[#1B4D3E] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <ConciergeBell className="text-[#C9A961]" size={32} />
              <div>
                <h3 className="font-serif text-xl text-white">Need anything during your stay?</h3>
                <p className="text-sm text-white/70">Request a restaurant, extra transfer, or activity.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowConcierge(true)}
              className="bg-[#C9A961] text-[#1B4D3E] px-6 py-3 text-sm uppercase tracking-widest hover:bg-white transition whitespace-nowrap"
            >
              Make a Request
            </button>
          </div>
        )}

        {/* CONCIERGE MODAL */}
        {showConcierge && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#F5F0E6] w-full max-w-md p-8 shadow-2xl relative">
              <button onClick={() => setShowConcierge(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                <X size={24} />
              </button>
              <h3 className="font-serif text-2xl text-[#1B4D3E] mb-6">Concierge Request</h3>
              <form onSubmit={handleConciergeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Request Type</label>
                  <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="Private Chauffeur">Private Chauffeur</option>
                    <option value="Excursions & Tours">Excursions / Tours</option>
                    <option value="Restaurant Reservation">Fine Dining</option>
                    <option value="Special Event">Special Occasion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Details</label>
                  <textarea required value={requestDetails} onChange={(e) => setRequestDetails(e.target.value)} rows={4} placeholder="E.g., Table for 2 at Le Château on Thursday at 8pm." className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]"></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isSubmittingRequest} className="flex-1 bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50">
                    {isSubmittingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                  <button type="button" onClick={() => setShowConcierge(false)} className="flex-1 border border-[#1B4D3E] text-[#1B4D3E] py-3 text-xs uppercase tracking-widest hover:bg-white transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRE-ARRIVAL INTAKE MODAL */}
        {showIntake && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#F5F0E6] w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowIntake(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                <X size={24} />
              </button>
              <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Pre-Arrival Preferences</h3>
              <p className="text-sm text-gray-600 mb-6">Help us prepare for your arrival so everything is perfect.</p>
              
              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Flight Arrival Number</label>
                  <input required name="flight" placeholder="e.g., MK 047" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
                
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Dietary Requirements</label>
                  <input name="dietary" placeholder="e.g., 1 Vegan, 1 Nut Allergy" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Celebrating an Occasion?</label>
                  <select name="occasion" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="None">None</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Car Seats Required?</label>
                  <input name="carseats" placeholder="e.g., 1 infant seat, 1 booster" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Preferred Pace</label>
                  <select name="pace" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="Relaxed">Relaxed (Lots of downtime)</option>
                    <option value="Balanced">Balanced (Mix of activity and rest)</option>
                    <option value="Action-Packed">Action-Packed (Maximize every day)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#E5DFD3] mt-6">
                  <button type="submit" disabled={isSubmittingIntake} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50">
                    {isSubmittingIntake ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BRANDING MODAL */}
        {showBranding && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#F5F0E6] w-full max-w-md p-8 shadow-2xl relative">
              <button onClick={() => setShowBranding(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                <X size={24} />
              </button>
              
              <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Brand Customisation</h3>
              <p className="text-sm text-gray-500 mb-6">Upload your company logo and personalise your welcome message.</p>
              
              {brandSuccess ? (
                <div className="text-center py-12 bg-green-50 border border-green-200">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                  <h3 className="font-serif text-2xl text-green-800 mb-2">Submitted for Review</h3>
                  <p className="text-sm text-green-700">Our operations team will approve your custom branding shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Company / Group Name</label>
                    <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Acme Corporation" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Custom Welcome Message</label>
                    <textarea value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} placeholder="e.g., Welcome to Mauritius, Acme Team!" rows={2} className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Company Logo</label>
                    <div className="border border-dashed border-[#C9A961] bg-white p-4 flex items-center justify-center relative cursor-pointer">
                      <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="text-center">
                        <UploadCloud className="mx-auto text-[#C9A961] mb-1" size={20} />
                        <span className="text-xs text-gray-500">{logoFile ? logoFile.name : "Click to upload (PNG/SVG)"}</span>
                      </div>
                    </div>
                  </div>

                  {booking?.branding_status === 'approved' && (
                    <div className="text-xs text-green-700 bg-green-50 p-2 border border-green-200 text-center">
                      Currently approved. Submitting again will require re-approval.
                    </div>
                  )}

                  <button type="submit" disabled={isSubmittingBrand} className="w-full bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 mt-2">
                    {isSubmittingBrand ? 'Uploading...' : 'Submit for Approval'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function PortalHub() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading...</div>}>
      <HubContent />
    </Suspense>
  )
}