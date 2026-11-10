"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldCheck, FileText, ChevronRight, MessageCircle, Music2, Phone, Mail, MapPin } from 'lucide-react'

export default function TermsPage() {
  // Fix for the Date Hydration Error
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))
  }, [])

  // Updated Table of Contents with Inclusive Travel added
  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "booking-journey", title: "2. Booking & Payments" },
    { id: "insurance", title: "3. Travel Insurance" },
    { id: "visas", title: "4. Passports & Visas" },
    { id: "portal", title: "5. Guest Portal & Upsells" },
    { id: "inclusive", title: "6. Inclusive & Accessible Travel" },
    { id: "guarantee", title: "7. The Service Guarantee" },
    { id: "force-majeure", title: "8. Force Majeure" },
    { id: "liability", title: "9. Our Liability" },
    { id: "law", title: "10. Governing Law" },
    { id: "contact", title: "Contact Us" },
  ]

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* HEADER */}
      <section className="pt-16 pb-12 px-6 border-b border-[#E5DFD3] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          {/* LOGO PLACED HERE */}
          <Link href="/" className="mb-10 inline-block hover:opacity-80 transition">
            <Image 
              src="/logo-light.png" 
              alt="Peace and Afrova" 
              width={300} 
              height={100} 
              className="h-16 md:h-20 w-auto object-contain" 
              priority
            />
          </Link>

          <div className="w-full flex justify-start mb-6">
             <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck className="text-[#C9A961]" size={28} />
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] font-bold">Legal Framework</div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Terms & Conditions</h1>
          
          {/* DYNAMIC DATE FIXED HERE */}
          <p className="text-sm text-gray-500">Last updated: {currentDate || 'Loading...'}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pt-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR / TABLE OF CONTENTS */}
          <div className="lg:w-1/4">
            <div className="sticky top-12 bg-white p-6 border border-[#E5DFD3] shadow-sm hidden lg:block">
              <h3 className="font-serif text-lg text-[#1B4D3E] mb-4 flex items-center gap-2 border-b border-[#E5DFD3] pb-2">
                <FileText size={18} className="text-[#C9A961]" /> Contents
              </h3>
              <ul className="space-y-3 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-gray-600 hover:text-[#C9A961] transition flex items-center gap-1">
                      <ChevronRight size={14} className="text-[#C9A961] shrink-0" /> {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* MAIN TEXT */}
          <div className="lg:w-3/4 bg-white p-8 md:p-12 shadow-sm border border-[#E5DFD3]">
            <div className="prose prose-lg max-w-none text-[#4A4A4A] font-light leading-relaxed space-y-12">
              
              {/* 1. INTRODUCTION */}
              <div id="introduction" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">1. Introduction</h2>
                <p>
                  Welcome to Peace and Afrova Group Company Ltd ("we", "our", or "us"). These Terms and Conditions govern your use of our website, your Guest Portal, and the travel services we provide across Mauritius, Seychelles, Reunion, and Rodrigues. By making a booking with us, you agree to these terms in full.
                </p>
                <div className="mt-4 p-4 bg-[#FAF7F0] border border-[#E5DFD3] text-sm text-gray-600">
                  <strong>Company Information:</strong><br/>
                  Business Registration Number (BRN): <strong>C26240240</strong><br/>
                  Tax Account Number (TAN): <strong>28593850</strong>
                </div>
              </div>

              {/* 2. THE BOOKING JOURNEY (SINGITA MODEL) */}
              <div id="booking-journey" className="scroll-mt-24 border-y border-[#E5DFD3] py-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-[#FAF7F0]">
                <div className="text-center mb-10">
                  <span className="text-[#C9A961] text-xs tracking-[0.3em] uppercase font-bold">Reservations & Financial Clarity</span>
                  <h2 className="font-serif text-3xl text-[#1B4D3E] mt-2">Your Journey, Secured.</h2>
                  <p className="text-[#666] max-w-2xl mx-auto mt-3 text-sm">
                    Our booking and payment framework is designed to provide clarity, confidence, and a seamless reservation experience from your first enquiry to your arrival.
                  </p>
                </div>

                {/* DEPOSIT CARDS */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {/* STANDARD */}
                  <div className="bg-[#1B4D3E] text-white p-6 md:p-8 rounded-sm shadow-sm">
                    <span className="text-[#E4CA91] text-[10px] uppercase tracking-[0.2em] font-bold">Standard Reservations</span>
                    <h3 className="font-serif text-2xl mt-3 mb-2">25% Deposit</h3>
                    <p className="text-white/80 text-sm">The remaining 75% is payable 60 days before arrival.</p>
                    <div className="border-t border-white/20 mt-6 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#E4CA91] text-3xl font-serif">21</p>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Days Hold</p>
                      </div>
                      <div>
                        <p className="text-[#E4CA91] text-3xl font-serif">60</p>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Days Before Arrival</p>
                      </div>
                    </div>
                  </div>

                  {/* FESTIVE */}
                  <div className="bg-[#E9D9B5] text-[#1B4D3E] p-6 md:p-8 rounded-sm shadow-sm border border-[#D4C29C]">
                    <span className="text-[#856B37] text-[10px] uppercase tracking-[0.2em] font-bold">Festive Reservations</span>
                    <h3 className="font-serif text-2xl mt-3 mb-2">50% Deposit</h3>
                    <p className="text-[#4A5149] text-sm">The remaining 50% is payable 120 days before arrival.</p>
                    <div className="border-t border-[#BDA878] mt-6 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-3xl font-serif">21</p>
                        <p className="text-[10px] text-[#665738] uppercase tracking-widest mt-1">Days Hold</p>
                      </div>
                      <div>
                        <p className="text-3xl font-serif">120</p>
                        <p className="text-[10px] text-[#665738] uppercase tracking-widest mt-1">Days Before Arrival</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6 STAGES */}
                <div className="bg-white border border-[#E5DFD3] p-6 md:p-8">
                  <h3 className="font-serif text-2xl text-[#1B4D3E] mb-6">The Reservation Process</h3>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      ["01", "Enquiry & Itinerary", "Share your requirements. We prepare a personalised proposal."],
                      ["02", "Provisional Hold", "Services may be held for up to 21 days, subject to availability."],
                      ["03", "Commitment Deposit", "Settle the applicable 25% (Standard) or 50% (Festive) deposit."],
                      ["04", "Booking Confirmation", "Your reservation is confirmed once payment clears and suppliers are locked."],
                      ["05", "Final Settlement", "Settle the balance 60 days (Standard) or 120 days (Festive) before arrival."],
                      ["06", "Pre-Arrival & Travel", "Our team coordinates your confirmed arrangements for arrival."]
                    ].map(([number, title, description]) => (
                      <div key={number} className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-[#1B4D3E] text-[#E4CA91] flex items-center justify-center font-serif text-sm">
                          {number}
                        </div>
                        <div>
                          <h4 className="text-[#1B4D3E] font-bold text-sm mb-1">{title}</h4>
                          <p className="text-[#666] text-xs leading-relaxed">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CANCELLATIONS */}
                <div className="mt-10">
                  <h3 className="font-serif text-2xl text-[#1B4D3E] mb-4">Cancellation Framework</h3>
                  <div className="bg-white rounded-sm border border-[#E5DFD3] overflow-hidden">
                    
                    {/* Standard Cancellation */}
                    <div className="p-5 bg-[#1B4D3E] text-white flex justify-between items-center">
                      <div>
                        <h4 className="font-serif text-lg">Standard Cancellations</h4>
                        <p className="text-white/70 text-xs">Travel outside the festive period.</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="font-medium text-[#1B4D3E] text-sm">61 days or more before arrival</p>
                        </div>
                        <span className="text-[#1B4D3E] font-serif text-xl">25% Charge</span>
                      </div>
                      <div className="border-t border-[#E5DFD3]" />
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="font-medium text-[#1B4D3E] text-sm">60 days or fewer before arrival</p>
                        </div>
                        <span className="text-red-700 font-serif text-xl">100% Charge</span>
                      </div>
                    </div>

                    {/* Festive Cancellation */}
                    <div className="p-5 bg-[#E9D9B5] border-t border-[#D4C29C]">
                      <h4 className="font-serif text-lg text-[#1B4D3E]">Festive Cancellations</h4>
                      <p className="text-[#665738] text-xs">15 December – 5 January.</p>
                    </div>
                    <div className="p-5 space-y-4 bg-[#FAF7F0]">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="font-medium text-[#1B4D3E] text-sm">121 days or more before arrival</p>
                        </div>
                        <span className="text-[#1B4D3E] font-serif text-xl">50% Charge</span>
                      </div>
                      <div className="border-t border-[#D4C29C]" />
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="font-medium text-[#1B4D3E] text-sm">120 days or fewer before arrival</p>
                        </div>
                        <span className="text-red-800 font-serif text-xl">100% Charge</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-3">
                    Cancellations must be submitted in writing. Certain third-party suppliers (e.g., private airlines, luxury villas) may have stricter non-refundable policies which will be disclosed in writing prior to payment.
                  </p>
                </div>
              </div>

              {/* 3. INSURANCE */}
              <div id="insurance" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">3. Travel Insurance</h2>
                <p>It is a strict condition of booking that you have comprehensive travel insurance covering medical expenses, repatriation, cancellation, and personal belongings. Peace and Afrova Group Company Ltd is not liable for any costs arising from a lack of adequate insurance.</p>
              </div>

              {/* 4. VISAS */}
              <div id="visas" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">4. Passports & Visas</h2>
                <p>You are solely responsible for ensuring you have a valid passport (with at least 6 months validity) and any necessary visas for travel. We are happy to provide guidance, but we cannot be held responsible if you are denied entry at the border.</p>
              </div>

              {/* 5. PORTAL */}
              <div id="portal" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">5. Guest Portal & Instant Requests</h2>
                <p>Upon booking, you will receive access to your private Guest Portal. You are responsible for keeping your login credentials secure.</p>
                <p className="mt-2">Any concierge requests or upgrades made through the Guest Portal are <strong>requests only</strong>. They do not constitute a confirmed booking until Peace and Afrova provides a formal quotation and the client completes payment.</p>
              </div>

              {/* 6. INCLUSIVE & ACCESSIBLE TRAVEL (NEW SECTION) */}
              <div id="inclusive" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">6. Inclusive & Accessible Travel</h2>
                <p>
                  Peace and Afrova is deeply committed to making extraordinary travel accessible to everyone. To ensure we can provide the highest standard of care and appropriate arrangements, the following conditions apply:
                </p>
                <ul className="list-disc list-inside space-y-3 mt-3">
                  <li>
                    <strong>Advance Disclosure:</strong> It is the client's responsibility to inform us in writing at the time of enquiry of any physical, medical, dietary, or cognitive requirements (including mobility aids, specific accessibility needs, or allergies) that may affect their travel experience.
                  </li>
                  <li>
                    <strong>Supplier Limitations:</strong> While we will make every effort to secure adapted vehicles, accessible rooms, and inclusive excursions, certain third-party properties, islands, or activities may have physical limitations (e.g., steep terrain, lack of ramps, or small boats). We will advise you of any known limitations prior to booking.
                  </li>
                  <li>
                    <strong>Medical Clearance:</strong> For clients requiring specialized medical equipment, oxygen, or traveling with complex medical conditions, we may require a doctor's clearance prior to finalizing the booking.
                  </li>
                  <li>
                    <strong>Companionship:</strong> Where necessary, we require clients requiring significant physical assistance to travel with a capable companion. Our team is here to coordinate logistics and hospitality, but we cannot provide personal medical or physical care.
                  </li>
                </ul>
              </div>

              {/* 7. GUARANTEE */}
              <div id="guarantee" className="scroll-mt-24 bg-[#FAF7F0] p-6 border-l-4 border-[#C9A961]">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">7. The Service Guarantee</h2>
                <p>We operate on a "Swiss Precision" promise. If a confirmed transfer or service provided directly by Peace and Afrova is delayed beyond 30 minutes due to our fault, we may issue a Service Credit. This credit is applied to your final invoice or future booking and is not redeemable for cash.</p>
              </div>

              {/* 8. FORCE MAJEURE */}
              <div id="force-majeure" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">8. Force Majeure</h2>
                <p>We cannot accept liability for any changes, delays, or cancellations caused by circumstances beyond our control, including extreme weather (such as cyclones), natural disasters, civil unrest, strikes, pandemics, or government travel restrictions.</p>
              </div>

              {/* 9. LIABILITY */}
              <div id="liability" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">9. Our Liability</h2>
                <p>Peace and Afrova acts as an agent for third-party suppliers. While we carefully vet our partners, we are not liable for any injury, loss, or damage caused by the acts or omissions of these independent third-party suppliers.</p>
              </div>

              {/* 10. LAW */}
              <div id="law" className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-3">10. Governing Law</h2>
                <p>These Terms and Conditions are governed by the laws of the Republic of Mauritius. Any disputes arising will be subject to the exclusive jurisdiction of the Mauritian courts.</p>
              </div>

              {/* CONTACT */}
              <div id="contact" className="pt-8 border-t border-[#E5DFD3] mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-6">Personal Assistance</h2>
                <p className="mb-6">For booking enquiries, payment clarification, amendments, or cancellation requests, please contact our official team.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="mailto:hello@peaceandafrova.com" className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] hover:border-[#C9A961] transition group">
                    <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                      <Mail size={14} className="text-[#C9A961]" /> Email
                    </p>
                    <span className="text-sm text-gray-600 group-hover:text-[#1B4D3E]">hello@peaceandafrova.com</span>
                  </a>
                  
                  <a href="https://wa.me/23057400125" target="_blank" rel="noopener noreferrer" className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] hover:border-[#C9A961] transition group">
                    <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                      <MessageCircle size={14} className="text-[#C9A961]" /> WhatsApp
                    </p>
                    <span className="text-sm text-gray-600 group-hover:text-[#1B4D3E]">+230 5740 0125</span>
                  </a>

                  <a href="tel:+23057400125" className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] hover:border-[#C9A961] transition group">
                    <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                      <Phone size={14} className="text-[#C9A961]" /> Telephone
                    </p>
                    <span className="text-sm text-gray-600 group-hover:text-[#1B4D3E]">+230 5740 0125</span>
                  </a>

                  <a href="https://www.tiktok.com/@peace_and_afrova_group" target="_blank" rel="noopener noreferrer" className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] hover:border-[#C9A961] transition group">
                    <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                      <Music2 size={14} className="text-[#C9A961]" /> TikTok
                    </p>
                    <span className="text-sm text-gray-600 group-hover:text-[#1B4D3E]">@Peace_and_Afrova_Group</span>
                  </a>
                </div>

                <div className="mt-4 bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                  <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                    <MapPin size={14} className="text-[#C9A961]" /> Registered Address
                  </p>
                  <span className="text-sm text-gray-600">Curepipe Forest Side, Mauritius</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}