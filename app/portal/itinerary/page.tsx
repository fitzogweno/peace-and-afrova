"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Printer, MapPin, CheckCircle, Clock, Compass, Phone, Mail, Car, CloudSun, MessageCircle, Lock } from 'lucide-react'

function ItineraryContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<any>(null)
  const [isDriverUnlocked, setIsDriverUnlocked] = useState(false)

  useEffect(() => {
    if (!quoteRef) return
    async function fetchBooking() {
      const { data } = await supabase
        .from('bookings')
        .select(`*, quotations ( quotation_items ( * ), supplier_bookings ( * ), enquiries ( hotel_details, customers ( full_name ) ) )`)
        .eq('booking_ref', quoteRef)
        .single()
      
      if (data) {
        setBooking(data)
        fetchWeather()
        
        // 10-Day Driver Unlock Logic
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
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) return
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Port%20Louis,MU&units=metric&appid=${apiKey}`)
      const data = await res.json()
      if (data.main) setWeather(data)
    } catch (err) {}
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading...</div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-600">Itinerary not found.</div>

  const items = (booking.quotations?.quotation_items || []).filter((item: any) => item.description && item.description.trim() !== '')
  const supplierBookings = booking.quotations?.supplier_bookings || []
  const hotelDetails = booking.quotations?.enquiries?.hotel_details || 'To be confirmed'
  
  // Use the first confirmed supplier booking as the primary driver card
  const primaryTransfer = supplierBookings.length > 0 ? supplierBookings[0] : null

  const destination = hotelDetails === 'To be confirmed' || !hotelDetails ? 'Port Louis, Mauritius' : hotelDetails
  const mapUrl = `https://maps.google.com/maps?saddr=Sir+Seewoosagur+Ramgoolam+International+Airport,+Mauritius&daddr=${encodeURIComponent(destination)}&output=embed`

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-8 px-4 md:py-16 md:px-8 font-sans text-[#1A1A1A]">
      
      <div className="no-print max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl text-[#1B4D3E]">Your Travel Itinerary</h1>
          <p className="text-xs tracking-widest uppercase text-gray-500 mt-1">Ref: {booking.booking_ref}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1B4D3E] text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-[#E5DFD3] print:shadow-none print:border-none p-8 md:p-12">
        
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-[#FAF7F0] p-6 border border-[#E5DFD3]">
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

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {weather && (
            <div className="bg-[#1B4D3E] text-white p-6 flex items-center justify-between">
              <div>
                <div className="text-xs tracking-widest uppercase text-[#C9A961] mb-1 font-medium">Mauritius Weather</div>
                <div className="text-2xl font-serif">{Math.round(weather.main.temp)}°C · {weather.weather[0].main}</div>
                <div className="text-xs opacity-70 mt-1">Live forecast for your arrival</div>
              </div>
              <CloudSun size={48} className="text-[#C9A961] opacity-80" />
            </div>
          )}

          {primaryTransfer && (
            <div className="bg-white border border-[#C9A961] p-6 relative overflow-hidden">
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
                    <a 
                      href={`https://wa.me/${primaryTransfer.driver_phone.replace(/\s+/g, '')}`} 
                      target="_blank"
                      className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 text-xs uppercase tracking-widest hover:bg-green-700 transition"
                    >
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
          <iframe
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          ></iframe>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#E5DFD3] pb-2">
            <Compass className="text-[#C9A961]" size={20} />
            <h2 className="font-serif text-2xl text-[#1B4D3E]">Your Private Arrangements</h2>
          </div>
          
          {items.map((item: any, index: number) => {
            const confirmation = supplierBookings.find((sb: any) => sb.service_description === item.description)
            return (
              <div key={item.id} className="relative print-card pl-6 border-l-2 border-[#C9A961]">
                <div className="absolute w-3 h-3 bg-[#1B4D3E] rounded-full -left-[7px] top-2" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                  <div>
                    <div className="text-xs tracking-widest uppercase text-gray-400 mb-1">Service {index + 1}</div>
                    <h3 className="font-serif text-xl text-[#1B4D3E]">{item.description}</h3>
                  </div>
                  {confirmation ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 border border-green-200">
                      <CheckCircle size={14} /> Confirmed (Ref: {confirmation.confirmation_number})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 border border-orange-200">
                      <Clock size={14} /> Pending Confirmation
                    </span>
                  )}
                </div>
                <div className="bg-[#FAF7F0] p-4 text-sm text-gray-600 grid grid-cols-2 gap-4">
                  <div><span className="block text-xs uppercase text-gray-400 mb-1">Travellers</span>{item.pax} Persons</div>
                  <div><span className="block text-xs uppercase text-gray-400 mb-1">Service Type</span>Private Transfer / Tour</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-[#1B4D3E] p-6 text-white text-center print:bg-transparent print:text-black print:border print:border-[#E5DFD3]">
          <h4 className="font-serif text-xl mb-2">Your Dedicated Concierge</h4>
          <p className="text-sm text-ivory/70 print:text-gray-600 mb-4">Should you require any assistance, please do not hesitate to contact us.</p>
          <div className="flex flex-col md:flex-row justify-center gap-6 text-sm">
            <span className="flex items-center justify-center gap-2"><Phone size={14} /> +230 5740 0125</span>
            <span className="flex items-center justify-center gap-2"><Mail size={14} /> hello@peaceandafrova.com</span>
          </div>
        </div>

      </div>
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