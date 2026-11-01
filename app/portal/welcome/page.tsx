"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Phone, Shield, Wifi, Map, Info } from 'lucide-react'

function WelcomeContent() {
  const searchParams = useSearchParams()
  const quoteRef = searchParams.get('ref') || ''

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-3xl mx-auto">
        
        <Link href={`/portal/hub?ref=${quoteRef}`} className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
          <ArrowLeft size={16} /> Back to Portal
        </Link>

        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">Peace and Afrova</div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Welcome to Mauritius</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-6" />
          <p className="text-lg text-gray-600 font-light">
            Your journey begins here. We have prepared everything you need for a seamless arrival.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* EMERGENCY CONTACTS */}
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3]">
            <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4 flex items-center gap-2">
              <Shield className="text-[#C9A961]" /> Emergency Contacts
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                <p className="font-medium text-[#1B4D3E]">Police / Ambulance</p>
                <p className="text-lg font-serif text-[#3D8B8B]">999 / 112</p>
              </div>
              <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                <p className="font-medium text-[#1B4D3E]">Your Dedicated Concierge</p>
                <p className="text-lg font-serif text-[#3D8B8B]">+230 5740 0125</p>
                <a href="https://wa.me/23057400125" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline mt-1 inline-block">Chat on WhatsApp</a>
              </div>
            </div>
          </div>

          {/* SIM & WIFI */}
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3]">
            <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4 flex items-center gap-2">
              <Wifi className="text-[#C9A961]" /> Staying Connected
            </h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p><strong>Airport SIM Cards:</strong> You can purchase a local SIM card (Emtel or Orange) at SSR International Airport in the arrivals hall. You will need your passport.</p>
              <p><strong>eSIM:</strong> If your phone supports eSIM, we recommend downloading an app like Airalo or Holafly before you travel for instant data upon landing.</p>
              <p><strong>Hotel WiFi:</strong> All premium hotels in Mauritius provide complimentary high-speed WiFi.</p>
            </div>
          </div>

          {/* LOCAL INFORMATION */}
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3]">
            <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4 flex items-center gap-2">
              <Map className="text-[#C9A961]" /> Local Tips
            </h2>
            <ul className="text-sm text-gray-600 space-y-3 leading-relaxed list-disc list-inside">
              <li><strong>Currency:</strong> The local currency is the Mauritian Rupee (MUR). We recommend carrying some cash for local markets, though cards are widely accepted.</li>
              <li><strong>Tipping:</strong> Tipping is not mandatory but is appreciated for exceptional service (approx. 10% at restaurants).</li>
              <li><strong>Language:</strong> English is the official business language, but French and Mauritian Creole are widely spoken.</li>
              <li><strong>Weather:</strong> The island enjoys a tropical climate. Pack light clothing, sunscreen, and a light jacket for breezy evenings.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WelcomeContent />
    </Suspense>
  )
}