"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Users, ShieldCheck, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react'

export default function HelicopterTourPage() {
  const router = useRouter()
  
  const [needsTransport, setNeedsTransport] = useState(false)
  const [passengers, setPassengers] = useState(2)
  const [transportZone, setTransportZone] = useState('North') 
  
  // UPDATED: 25% DMC Markup (Net €395 -> Sell €495)
  const basePrice = 495 
  
  // UPDATED: Luxury Private Chauffeur Rates (Round Trip)
  const transportRates: Record<string, number> = {
    'North': 3500, 
    'South': 5000, 
    'East': 4500,
    'West': 4500
  }

  const transportCost = needsTransport ? transportRates[transportZone] : 0
  const totalEstimateEUR = basePrice * passengers

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams({
      activity: 'Mauritius Underwater Waterfall Helicopter',
      pax: passengers.toString(),
      transport: needsTransport ? `${transportZone} (Rs ${transportCost})` : 'none'
    }).toString()
    
    router.push(`/bespoke?${query}`)
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans pb-24">
      
      {/* HERO */}
      <div className="relative h-[60vh] w-full">
        <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600" className="w-full h-full object-cover" alt="Helicopter" />
        {/* Using Ocean Green overlay instead of black for branding */}
        <div className="absolute inset-0 bg-[#1B4D3E]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="bg-[#C9A961] text-[#1B4D3E] px-4 py-1 text-xs uppercase tracking-widest font-bold mb-4">Marquee Experience</span>
          <h1 className="font-serif text-5xl md:text-7xl mb-4">The Underwater Waterfall</h1>
          <p className="text-lg md:text-xl max-w-2xl font-light">45-minute scenic flight over Le Morne and the Black River Gorges in a premium Airbus H130.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-wrap gap-6 border-b border-[#E5DFD3] pb-8">
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Clock size={20} className="text-[#C9A961]"/> 45 Minutes</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Users size={20} className="text-[#C9A961]"/> Max 6 Passengers</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><MapPin size={20} className="text-[#C9A961]"/> Triolet Heliport</div>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6">The Experience</h2>
            <p className="text-[#4A4A4A] leading-relaxed mb-6 font-light">
              Experience the world-famous optical illusion of the underwater waterfall from the skies. Departing from Triolet, you will fly over the stunning northern islands, Port Louis, and down the west coast to Le Morne, before passing over the Black River Gorges and Chamarel's seven-colored earth.
            </p>
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4">What's Included</h3>
            <ul className="grid md:grid-cols-2 gap-4">
              {['Premium H130 Helicopter', 'Audio Commentary via Headsets', 'Safety Briefing', 'Water & Coffee at Base'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#4A4A4A]"><CheckCircle2 size={16} className="text-[#C9A961]"/> {item}</li>
              ))}
            </ul>
          </div>

          {/* AVIATION REQUIREMENTS - Themed to Luxury Sand & Red */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-red-500 p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-red-500"/> Aviation Requirements</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li>Passport copy required within 24 hours of booking.</li>
              <li>Exact passenger weights (kg) must be provided.</li>
              <li>Individuals over 95kg may not be permitted to board.</li>
              <li>Arrive at Triolet Heliport 45 minutes before departure.</li>
            </ul>
          </div>

          {/* POLICY BLOCK - Themed to Luxury Sand & Gold */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-[#C9A961] p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-[#C9A961]"/> Payment & Cancellation Policy</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li><strong>Deposit:</strong> 30% required to confirm. Balance due 7 days before flight.</li>
              <li><strong>Cancel &gt; 48h:</strong> 100% refund (less chauffeur fees if applicable).</li>
              <li><strong>Cancel 24-48h:</strong> 50% refund.</li>
              <li><strong>Cancel &lt; 24h:</strong> No refund.</li>
              <li><strong>Weather:</strong> If the pilot cancels due to weather, you receive a 100% refund or free reschedule.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: SMART BOOKING WIDGET */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 border border-[#E5DFD3] shadow-xl sticky top-8">
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-6">Build Your Proposal</h3>
            
            <form onSubmit={handleBook} className="space-y-6">
              
              <div>
                <label className="text-xs uppercase tracking-widest text-[#3D8B8B] font-bold block mb-2">Passengers</label>
                <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full border-b border-[#E5DFD3] py-3 text-lg focus:outline-none focus:border-[#C9A961] bg-transparent text-[#1B4D3E] font-serif">
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {/* LUXURY CHAUFFEUR UPSELL */}
              <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={needsTransport} onChange={(e) => setNeedsTransport(e.target.checked)} className="w-5 h-5 accent-[#1B4D3E]" />
                  <span className="font-bold text-sm text-[#1B4D3E]">Add Private Chauffeur</span>
                </label>
                
                {needsTransport && (
                  <div className="mt-3 pt-3 border-t border-[#E5DFD3] animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#3D8B8B] font-bold block mb-1">Where are you staying?</label>
                    <select value={transportZone} onChange={(e) => setTransportZone(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961] text-[#1B4D3E]">
                      <option value="North">North (Grand Baie, Trou aux Biches)</option>
                      <option value="South">South (Bel Ombre, Le Morne)</option>
                      <option value="East">East (Belle Mare, Trou d'Eau Douce)</option>
                      <option value="West">West (Flic en Flac, Tamarin)</option>
                    </select>
                    <p className="text-xs text-[#C9A961] mt-2 font-bold">+ Rs {transportRates[transportZone].toLocaleString()} (Round Trip)</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5DFD3]">
                <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                  <span>Flight (€{basePrice} x {passengers})</span>
                  <span>€{totalEstimateEUR.toLocaleString()}</span>
                </div>
                {needsTransport && (
                  <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                    <span>Chauffeur (Round Trip)</span>
                    <span>Rs {transportCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm uppercase tracking-widest font-bold text-[#1B4D3E]">Estimated Total</span>
                  
                  {/* FIXED: Using a template literal to avoid the TypeScript + Rs error */}
                  <span className="text-3xl font-serif text-[#1B4D3E]">
                    {`€${totalEstimateEUR.toLocaleString()}${needsTransport ? ` + Rs ${transportCost.toLocaleString()}` : ''}`}
                  </span>

                </div>
                <p className="text-[10px] text-gray-500 mt-3 text-right italic">* 30% deposit required to confirm.</p>
              </div>

              <button type="submit" className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition flex items-center justify-center gap-2">
                Request Official Quote <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}