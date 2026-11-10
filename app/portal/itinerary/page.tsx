"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Printer, MapPin, CheckCircle, Clock, Compass, Phone, Mail, Car, CloudSun, MessageCircle, Lock, ShieldCheck, Sparkles, Utensils, PartyPopper, Send, X, Plus } from 'lucide-react'
import QRCode from 'react-qr-code'

function ItineraryContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<any>(null)
  const [isDriverUnlocked, setIsDriverUnlocked] = useState(false)

  // --- UPSELL / REQUEST STATE ---
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestCategory, setRequestCategory] = useState('')
  const [requestDetails, setRequestDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  useEffect(() => {
    if (!quoteRef) return
    async function fetchBooking() {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *, service_credit,
          quotations ( 
            quotation_items ( * ), 
            supplier_bookings ( * ), 
            enquiries ( hotel_details, destination, customers ( full_name ) ) 
          )
        `)
        .eq('booking_ref', quoteRef)
        .single()
      
      if (data) {
        setBooking(data)
        fetchWeather()
        
        const travelDate = new Date(data.travel_start)
        const today = new Date()
        const diffTime = travelDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 10 && diffDays >= 0) {
          setIsDriverUnlocked(true)
        }
      }
      setLoading(false)
    }
    fetchBooking()
  }, [quoteRef])

  async function fetchWeather() {
    try {
      // Default to Mauritius if no destination provided
      const destSlug = booking?.quotations?.enquiries?.destination?.toLowerCase().includes('seychelles') 
        ? 'seychelles' 
        : booking?.quotations?.enquiries?.destination?.toLowerCase().includes('reunion') 
          ? 'reunion' 
          : 'mauritius';
          
      const res = await fetch(`/api/weather?slug=${destSlug}`)
      const data = await res.json()
      if (res.ok) setWeather(data)
    } catch (err) {
      console.error("Failed to load weather", err)
    }
  }

  // --- UPSELL REQUEST SUBMISSION ---
  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch('/api/concierge-request', {
        method: 'POST',
        body: JSON.stringify({
          bookingRef: quoteRef,
          customerName: booking.customer_name,
          requestType: `UPSell: ${requestCategory}`,
          requestDetails: requestDetails
        })
      })
      setRequestSuccess(true)
      setTimeout(() => {
        setShowRequestModal(false)
        setRequestSuccess(false)
        setRequestDetails('')
      }, 3000)
    } catch (err) {
      alert("Failed to send request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading...</div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-600">Itinerary not found.</div>

  const quotation = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
  const enquiries = quotation?.enquiries;
  const enquiry = Array.isArray(enquiries) ? enquiries[0] : enquiries;
  
  const items = (quotation?.quotation_items || []).filter((item: any) => item.description && item.description.trim() !== '')
  const supplierBookings = quotation?.supplier_bookings || []
  const hotelDetails = enquiry?.hotel_details || 'To be confirmed'
  
  const primaryTransfer = supplierBookings.length > 0 ? supplierBookings[0] : null
  const serviceCredit = booking.service_credit || 0 

  const destination = hotelDetails === 'To be confirmed' || !hotelDetails ? 'Port Louis, Mauritius' : hotelDetails
  const mapUrl = `https://maps.google.com/maps?saddr=Sir+Seewoosagur+Ramgoolam+International+Airport,+Mauritius&daddr=${encodeURIComponent(destination)}&output=embed`

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-8 px-4 md:py-16 md:px-8 font-sans text-[#1A1A1A] print:bg-white print:p-0">
      
      {/* HEADER - HIDDEN ON PRINT */}
      <div className="no-print print:hidden max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl text-[#1B4D3E]">Your Travel Itinerary</h1>
          <p className="text-xs tracking-widest uppercase text-gray-500 mt-1">Ref: {booking.booking_ref}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1B4D3E] text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-[#E5DFD3] print:shadow-none print:border-none p-8 md:p-12">
        
        {/* SERVICE GUARANTEE BANNER */}
        {serviceCredit > 0 && (
          <div className="mb-8 bg-green-50 border border-green-200 p-4 flex items-start gap-3 rounded-sm print:hidden animate-in fade-in">
            <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h4 className="font-bold text-green-800 text-sm">Service Guarantee Applied</h4>
              <p className="text-sm text-green-700">As part of our Swiss Precision promise, a credit of <strong>Rs {serviceCredit.toLocaleString()}</strong> has been applied to your invoice due to a slight delay.</p>
            </div>
          </div>
        )}

        {/* ... Rest of the Hero Header and Route Map (Kept identical to your existing code) ... */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-[#E5DFD3] pb-8 mb-8">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">Peace and Afrova</div>
            <div className="font-serif text-3xl text-[#1B4D3E]">Travel Itinerary</div>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <div className="text-xs tracking-widest uppercase text-gray-500">Booking Reference</div>
            <div className="font-medium text-[#1B4D3E] text-xl">{booking.booking_ref}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-[#FAF7F0] p-6 border border-[#E5DFD3] print:bg-white print:border-gray-300">
          <div>
            <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-1 font-medium">Guest</div>
            <div className="font-medium text-[#1B4D3E]">{booking.customer_name}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-1 font-medium">Arrival Date</div>
            <div className="font-medium text-[#1B4D3E]">{booking.travel_start}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-1 font-medium">Hotel</div>
            <div className="font-medium text-[#1B4D3E]">{hotelDetails}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-1 font-medium">Pax</div>
            <div className="font-medium text-[#1B4D3E]">{items[0]?.pax || 1} Persons</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10 break-inside-avoid">
          {weather && (
            <div className="bg-[#1B4D3E] text-white p-6 flex items-center justify-between print:bg-white print:text-black print:border print:border-gray-300">
              <div>
                <div className="text-xs tracking-widest uppercase text-[#C9A961] mb-1 font-medium">{enquiry?.destination || 'Mauritius'} Weather</div>
                <div className="text-2xl font-serif">{Math.round(weather.temp)}°C · {weather.main}</div>
                <div className="text-xs opacity-70 mt-1 print:text-gray-600 capitalize">{weather.description}</div>
              </div>
              <CloudSun size={48} className="text-[#C9A961] opacity-80" />
            </div>
          )}

          {primaryTransfer && (
            <div className="bg-white border border-[#C9A961] p-6 relative overflow-hidden print:border-gray-300 break-inside-avoid">
              <div className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium flex items-center gap-2">
                <Car size={14} /> Your Private Chauffeur
              </div>
              
              {isDriverUnlocked ? (
                <>
                  <div className="font-serif text-xl text-[#1B4D3E] mb-2">{primaryTransfer.driver_name || 'Assigned Driver'}</div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>Plate: <strong className="text-[#1B4D3E]">{primaryTransfer.vehicle_plate || 'TBC'}</strong></span>
                  </div>
                  {primaryTransfer.driver_phone && (
                    <a href={`https://wa.me/${primaryTransfer.driver_phone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 text-xs uppercase tracking-widest hover:bg-green-700 transition print:hidden">
                      <MessageCircle size={14} /> Chat with Driver on WhatsApp
                    </a>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Lock className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500">Driver contact details will unlock 10 days before your arrival.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-10 print:hidden">
          <div className="text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium flex items-center gap-2">
            <MapPin size={14} /> Your Route from SSR Airport
          </div>
          <iframe width="100%" height="250" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={mapUrl}></iframe>
        </div>

        {/* --- LIVE TIMELINE / ARRANGEMENTS --- */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#E5DFD3] pb-2 break-inside-avoid">
            <Compass className="text-[#C9A961]" size={20} />
            <h2 className="font-serif text-2xl text-[#1B4D3E]">Your Private Arrangements</h2>
          </div>
          
          {items.map((item: any, index: number) => {
            const savedBooking = supplierBookings.find((sb: any) => sb.service_description === item.description)
            return (
              <div key={item.id} className="relative print-card pl-6 border-l-2 border-[#C9A961] flex flex-col md:flex-row gap-6 justify-between items-start md:items-center break-inside-avoid">
                <div className="flex-1">
                  <div className="text-xs tracking-widest uppercase text-gray-400 mb-1">Day {index + 1} / Service</div>
                  <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">{item.description}</h3>
                  
                  {savedBooking ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 border border-green-200 print:bg-white print:border-gray-300 print:text-black">
                      <CheckCircle size={14} /> Confirmed (Ref: {savedBooking.confirmation_number})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 border border-orange-200 print:bg-white print:border-gray-300 print:text-black">
                      <Clock size={14} /> Pending Confirmation
                    </span>
                  )}
                </div>

                {savedBooking && (
                  <div className="bg-white p-2 border border-[#E5DFD3] flex flex-col items-center break-inside-avoid">
                    <QRCode value={`https://peaceandafrova.com/driver/scan?voucherId=${savedBooking.id}&client=${encodeURIComponent(booking.customer_name)}`} size={100} />
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-2">Scan on Pickup</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* --- NEW: ENHANCE YOUR JOURNEY (UPSELL WIDGET) --- */}
        <div className="mt-16 bg-[#FAF7F0] border border-[#C9A961] p-8 print:hidden shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <Sparkles className="text-[#C9A961]" size={28} />
            </div>
            <h3 className="font-serif text-2xl text-[#1B4D3E]">Enhance Your Experience</h3>
            <p className="text-sm text-gray-500 mt-1">Need something extra? Our team is ready to help.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => { setRequestCategory('Private Chauffeur'); setShowRequestModal(true); }} className="bg-white border border-[#E5DFD3] p-4 text-center hover:border-[#C9A961] hover:shadow-md transition group">
              <Car className="mx-auto text-[#C9A961] mb-3 group-hover:scale-110 transition" size={24} />
              <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider block">Private Chauffeur</span>
            </button>
            <button onClick={() => { setRequestCategory('Excursions & Tours'); setShowRequestModal(true); }} className="bg-white border border-[#E5DFD3] p-4 text-center hover:border-[#C9A961] hover:shadow-md transition group">
              <Compass className="mx-auto text-[#C9A961] mb-3 group-hover:scale-110 transition" size={24} />
              <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider block">Excursions</span>
            </button>
            <button onClick={() => { setRequestCategory('Restaurant Booking'); setShowRequestModal(true); }} className="bg-white border border-[#E5DFD3] p-4 text-center hover:border-[#C9A961] hover:shadow-md transition group">
              <Utensils className="mx-auto text-[#C9A961] mb-3 group-hover:scale-110 transition" size={24} />
              <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider block">Fine Dining</span>
            </button>
            <button onClick={() => { setRequestCategory('Special Occasion'); setShowRequestModal(true); }} className="bg-white border border-[#E5DFD3] p-4 text-center hover:border-[#C9A961] hover:shadow-md transition group">
              <PartyPopper className="mx-auto text-[#C9A961] mb-3 group-hover:scale-110 transition" size={24} />
              <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider block">Special Event</span>
            </button>
          </div>
        </div>

        {/* CONCIERGE BOX */}
        <div className="mt-12 bg-[#1B4D3E] p-6 text-white text-center print:bg-white print:text-black print:border print:border-gray-300 break-inside-avoid">
          <h4 className="font-serif text-xl mb-2">Your Dedicated Concierge</h4>
          <p className="text-sm text-ivory/70 print:text-gray-600 mb-4">Should you require any assistance, please do not hesitate to contact us.</p>
          <div className="flex flex-col md:flex-row justify-center gap-6 text-sm">
            <span className="flex items-center justify-center gap-2"><Phone size={14} /> +230 5740 0125</span>
            <span className="flex items-center justify-center gap-2"><Mail size={14} /> hello@peaceandafrova.com</span>
          </div>
        </div>

      </div>

      {/* --- UPSELL REQUEST MODAL --- */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-[#F5F0E6] w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            
            {requestSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Request Sent!</h3>
                <p className="text-sm text-gray-600">Our concierge will review your request and get back to you with options and pricing shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Request: {requestCategory}</h3>
                <p className="text-sm text-gray-500 mb-6">Tell us a little more about what you need.</p>
                
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Details</label>
                    <textarea 
                      required 
                      value={requestDetails} 
                      onChange={(e) => setRequestDetails(e.target.value)} 
                      rows={4} 
                      placeholder={`E.g., We would like to arrange a ${requestCategory.toLowerCase()} for 2 people on Day 3.`} 
                      className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961] bg-white"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Send Request'} <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ItineraryContent />
    </Suspense>
  )
}