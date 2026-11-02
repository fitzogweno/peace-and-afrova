"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Users, ShieldCheck, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react'

export default function SeychellesHelicopterPage() {
  const router = useRouter()
  
  const [needsTransport, setNeedsTransport] = useState(false)
  const [passengers, setPassengers] = useState(2)
  const [transportZone, setTransportZone] = useState('North') 
  
  // Sell Price (25% Markup on €2,610 Net)
  const basePrice = 3265 
  
  // Estimated Luxury Chauffeur Rates for Mahé (Round Trip)
  const transportRates: Record<string, number> = {
    'North': 4500, 
    'South': 6000, 
    'East': 5500,
    'West': 5500
  }

  const transportCost = needsTransport ? transportRates[transportZone] : 0

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams({
      activity: 'Seychelles Island Hopping Helicopter',
      pax: passengers.toString(),
      transport: needsTransport ? `${transportZone} (Rs ${transportCost})` : 'none'
    }).toString()
    
    router.push(`/bespoke?${query}`)
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans pb-24">
      
      {/* HERO */}
      <div className="relative h-[60vh] w-full">
        <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600" className="w-full h-full object-cover" alt="Seychelles Helicopter" />
        <div className="absolute inset-0 bg-[#1B4D3E]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="bg-[#C9A961] text-[#1B4D3E] px-4 py-1 text-xs uppercase tracking-widest font-bold mb-4">Ultra-Luxury Experience</span>
          <h1 className="font-serif text-5xl md:text-7xl mb-4">Island Hopping Scenic</h1>
          <p className="text-lg md:text-xl max-w-2xl font-light">90-minute private scenic flight over Mahé, Praslin, and La Digue in a premium Airbus H-120.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-wrap gap-6 border-b border-[#E5DFD3] pb-8">
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Clock size={20} className="text-[#C9A961]"/> 90 Minutes</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Users size={20} className="text-[#C9A961]"/> Max 4 Passengers</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><MapPin size={20} className="text-[#C9A961]"/> Zil Air Base, Mahé</div>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6">The Experience</h2>
            <p className="text-[#4A4A4A] leading-relaxed mb-6 font-light">
              Experience the ultimate aerial view of the Seychelles archipelago. Departing from Mahé, you will fly over the marine park, Victoria City, the Vallée de Mai, and the famous beaches of La Digue. This private charter offers absolute luxury and breathtaking views of the Indian Ocean.
            </p>
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4">What's Included</h3>
            <ul className="grid md:grid-cols-2 gap-4">
              {['90-minute private charter', 'Premium H-120 Helicopter', 'Access to Zil Air Lounge', 'Breathtaking views of La Digue'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#4A4A4A]"><CheckCircle2 size={16} className="text-[#C9A961]"/> {item}</li>
              ))}
            </ul>
          </div>

          {/* AVIATION REQUIREMENTS */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-red-500 p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-red-500"/> Aviation Requirements</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li>Passport copy required at check-in.</li>
              <li>Total passenger + luggage weight must not exceed 325 kg (for up to 4 passengers).</li>
              <li>Check-in 30 minutes before departure at Zil Air Base.</li>
            </ul>
          </div>

          {/* POLICY BLOCK */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-[#C9A961] p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-[#C9A961]"/> Payment & Cancellation Policy</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li><strong>Deposit:</strong> 30% required to confirm. Balance due 7 days before flight.</li>
              <li><strong>Cancellation:</strong> Please refer to ZilAir's terms. Weather cancellations are fully refundable or reschedulable.</li>
              <li><strong>Weight Limit:</strong> If the total weight exceeds 325 kg, ZilAir reserves the right to deny boarding.</li>
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
                  {[1,2,3,4].map(num => <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>)}
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
                      <option value="North">North (Beau Vallon, Glacis)</option>
                      <option value="South">South (Anse Royale, Baie Lazare)</option>
                      <option value="East">East (Victoria, Eden Island)</option>
                      <option value="West">West (Port Launay, Anse Boileau)</option>
                    </select>
                    <p className="text-xs text-[#C9A961] mt-2 font-bold">+ Rs {transportRates[transportZone].toLocaleString()} (Round Trip)</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5DFD3]">
                <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                  <span>Private Charter (Up to {passengers})</span>
                  <span>€{basePrice.toLocaleString()}</span>
                </div>
                {needsTransport && (
                  <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                    <span>Chauffeur (Round Trip)</span>
                    <span>Rs {transportCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm uppercase tracking-widest font-bold text-[#1B4D3E]">Estimated Total</span>
                  
                  <span className="text-3xl font-serif text-[#1B4D3E]">
                    {`€${basePrice.toLocaleString()}${needsTransport ? ` + Rs ${transportCost.toLocaleString()}` : ''}`}
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