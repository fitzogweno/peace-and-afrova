"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Users, ShieldCheck, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react'

export default function ReunionHelicopterPage() {
  const router = useRouter()
  
  const [passengers, setPassengers] = useState(2)
  const [transportZone, setTransportZone] = useState('South') 
  
  // UPDATED: 25% DMC Markup (Net €1,320 -> Sell €1,650 per person)
  const basePrice = 1650 
  
  // Réunion Transport Logic: 
  // South is included by the operator (Cost: 0).
  // North/West/East require a private chauffeur add-on.
  const transportRates: Record<string, number> = {
    'South': 0, // Complimentary shuttle included
    'North': 5500, 
    'West': 4500,
    'East': 4000
  }

  const transportCost = transportRates[transportZone]
  const totalFlightCost = basePrice * passengers

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams({
      activity: 'Reunion Volcano Private Flight',
      pax: passengers.toString(),
      transport: transportCost > 0 ? `Private Chauffeur - ${transportZone} (Rs ${transportCost})` : 'Complimentary South Shuttle'
    }).toString()
    
    router.push(`/bespoke?${query}`)
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans pb-24">
      
      {/* HERO */}
      <div className="relative h-[60vh] w-full">
        <img src="https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1600" className="w-full h-full object-cover" alt="Reunion Volcano" />
        <div className="absolute inset-0 bg-[#1B4D3E]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="bg-[#C9A961] text-[#1B4D3E] px-4 py-1 text-xs uppercase tracking-widest font-bold mb-4">Adventure & Luxury</span>
          <h1 className="font-serif text-5xl md:text-7xl mb-4">Volcano Private Flight</h1>
          <p className="text-lg md:text-xl max-w-2xl font-light">25-minute private flight directly over the active Piton de la Fournaise and its lunar landscape.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-wrap gap-6 border-b border-[#E5DFD3] pb-8">
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Clock size={20} className="text-[#C9A961]"/> 25 Minutes</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><Users size={20} className="text-[#C9A961]"/> Max 6 Passengers</div>
            <div className="flex items-center gap-2 text-[#1B4D3E]"><MapPin size={20} className="text-[#C9A961]"/> Pierrefonds Airport</div>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6">The Experience</h2>
            <p className="text-[#4A4A4A] leading-relaxed mb-6 font-light">
              Fly directly into the heart of an active volcano. Soar over the lunar landscape of Piton de la Fournaise, one of the most active volcanoes in the world. You will witness the dramatic cirques and the raw, untamed beauty of Réunion Island from a perspective few ever see.
            </p>
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4">What's Included</h3>
            <ul className="grid md:grid-cols-2 gap-4">
              {['25-minute private flight', 'Piton de la Fournaise route', 'Complimentary shuttle from South hotels', 'Coffee & Water at base'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#4A4A4A]"><CheckCircle2 size={16} className="text-[#C9A961]"/> {item}</li>
              ))}
            </ul>
          </div>

          {/* AVIATION REQUIREMENTS */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-red-500 p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-red-500"/> Aviation Requirements</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li>Passport or ID card required at check-in.</li>
              <li>Exact passenger weights (kg) must be provided at booking.</li>
              <li>Arrive at the helipad 30 minutes before departure.</li>
              <li>Flights are subject to VFR (Visual Flight Rules) weather conditions.</li>
            </ul>
          </div>

          {/* POLICY BLOCK */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] border-l-4 border-l-[#C9A961] p-6">
            <h3 className="font-bold text-[#1B4D3E] mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-[#C9A961]"/> Payment & Cancellation Policy</h3>
            <ul className="text-sm text-[#4A4A4A] space-y-2 list-disc pl-5 font-light">
              <li><strong>Deposit:</strong> 30% required to confirm. Balance due 7 days before flight.</li>
              <li><strong>Cancellation &gt; 48h:</strong> 100% refund.</li>
              <li><strong>Cancellation &lt; 48h:</strong> Subject to Corail Hélicoptères terms.</li>
              <li><strong>Weather:</strong> If the pilot cancels, you receive a 100% refund or free reschedule.</li>
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

              {/* TRANSPORT / SHUTTLE LOGIC */}
              <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                <label className="text-[10px] uppercase tracking-widest text-[#3D8B8B] font-bold block mb-2">Where are you staying?</label>
                <select value={transportZone} onChange={(e) => setTransportZone(e.target.value)} className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961] text-[#1B4D3E]">
                  <option value="South">South (Complimentary Shuttle)</option>
                  <option value="North">North (Private Chauffeur)</option>
                  <option value="West">West (Private Chauffeur)</option>
                  <option value="East">East (Private Chauffeur)</option>
                </select>
                {transportZone === 'South' ? (
                  <p className="text-xs text-[#3D8B8B] mt-2 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Shuttle Included by Operator
                  </p>
                ) : (
                  <p className="text-xs text-[#C9A961] mt-2 font-bold">
                    + Rs {transportCost.toLocaleString()} (Round Trip Chauffeur)
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5DFD3]">
                <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                  <span>Flight (€{basePrice} x {passengers})</span>
                  <span>€{totalFlightCost.toLocaleString()}</span>
                </div>
                
                {transportCost > 0 && (
                  <div className="flex justify-between text-sm text-[#4A4A4A] mb-1">
                    <span>Chauffeur (Round Trip)</span>
                    <span>Rs {transportCost.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm uppercase tracking-widest font-bold text-[#1B4D3E]">Estimated Total</span>
                  <span className="text-3xl font-serif text-[#1B4D3E]">
                    {`€${totalFlightCost.toLocaleString()}${transportCost > 0 ? ` + Rs ${transportCost.toLocaleString()}` : ''}`}
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