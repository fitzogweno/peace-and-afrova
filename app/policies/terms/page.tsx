"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldCheck, FileText, ChevronRight, MessageCircle, Music2, Phone, Mail, MapPin, Info } from 'lucide-react'

export default function TermsPage() {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))
  }, [])

  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "definitions", title: "2. Legal Definitions" },
    { id: "booking-journey", title: "3. Booking & Payments" },
    { id: "insurance", title: "4. Travel Insurance" },
    { id: "visas", title: "5. Passports & Visas" },
    { id: "portal", title: "6. Guest Portal & Upsells" },
    { id: "inclusive", title: "7. Inclusive & Accessible Travel" },
    { id: "guarantee", title: "8. The Service Guarantee" },
    { id: "force-majeure", title: "9. Force Majeure" },
    { id: "liability", title: "10. Our Liability" },
    { id: "law", title: "11. Governing Law" },
    { id: "contact", title: "Contact Us" },
  ]

  // Reusable component for the new badge style
  const Badge = ({ text }: { text: string }) => (
    <span className="inline-block bg-[#1B4D3E] text-[#C9A961] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-sm">
      {text}
    </span>
  )

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* HEADER */}
      <section className="pt-16 pb-12 px-6 border-b border-[#E5DFD3] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link href="/" className="mb-10 inline-block hover:opacity-80 transition">
            <Image src="/logo-light.png" alt="Peace and Afrova" width={300} height={100} className="h-16 md:h-20 w-auto object-contain" priority />
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
          <p className="text-sm text-gray-500">Last updated: {currentDate || 'Loading...'}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pt-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
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
            <div className="prose prose-lg max-w-none text-[#4A4A4A] font-light leading-relaxed space-y-14">
              
              {/* 1. INTRODUCTION */}
              <div id="introduction" className="scroll-mt-24">
                <Badge text="Section 01" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Introduction</h2>
                <p>
                  Welcome to Peace and Afrova Group Company Ltd ("we", "our", or "us"). These Terms and Conditions govern your use of our website, your Guest Portal, and the travel services we provide across Mauritius, Seychelles, Reunion, and Rodrigues. By making a booking with us, you agree to these terms in full.
                </p>
                <div className="mt-6 bg-[#FAF7F0] border-l-4 border-[#C9A961] p-5 text-sm text-gray-600">
                  <strong className="text-[#1B4D3E] block mb-1">Company Information</strong>
                  Business Registration Number (BRN): <strong>C26240240</strong><br/>
                  Tax Account Number (TAN): <strong>28593850</strong>
                </div>
              </div>

              {/* 2. DEFINITIONS (New Dark Block Style) */}
              <div id="definitions" className="scroll-mt-24">
                <Badge text="Section 02" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Legal Definitions</h2>
                <p className="mb-4">To ensure clarity throughout this agreement, the following terms carry specific meanings:</p>
                
                <div className="bg-[#1B4D3E] text-[#F5F0E6] p-6 rounded-lg font-mono text-sm shadow-md space-y-4">
                  <div>
                    <span className="text-[#C9A961] font-bold">"Provisional Hold"</span> — A temporary reservation of travel components for up to 21 days, pending payment of a commitment deposit. This is not a confirmed booking.
                  </div>
                  <div>
                    <span className="text-[#C9A961] font-bold">"Commitment Deposit"</span> — The initial non-refundable payment (25% or 50%) required to secure your reservation and trigger supplier confirmations.
                  </div>
                  <div>
                    <span className="text-[#C9A961] font-bold">"Festive Season"</span> — The designated high-demand period from 15 December to 5 January inclusive.
                  </div>
                </div>
              </div>

              {/* 3. BOOKING JOURNEY */}
              <div id="booking-journey" className="scroll-mt-24">
                <Badge text="Section 03" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Booking & Payments</h2>
                <p className="mb-6">
                  Our booking and payment framework is designed to provide clarity, confidence, and a seamless reservation experience from your first enquiry to your arrival.
                </p>

                {/* DEPOSIT CARDS */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#1B4D3E] text-white p-6 md:p-8 rounded-sm shadow-sm">
                    <span className="text-[#E4CA91] text-[10px] uppercase tracking-[0.2em] font-bold">Standard Reservations</span>
                    <h3 className="font-serif text-2xl mt-3 mb-2">25% Deposit</h3>
                    <p className="text-white/80 text-sm mb-6">The remaining 75% is payable 60 days before arrival.</p>
                    <div className="border-t border-white/20 pt-4 grid grid-cols-2 gap-4">
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

                  <div className="bg-[#E9D9B5] text-[#1B4D3E] p-6 md:p-8 rounded-sm shadow-sm border border-[#D4C29C]">
                    <span className="text-[#856B37] text-[10px] uppercase tracking-[0.2em] font-bold">Festive Reservations</span>
                    <h3 className="font-serif text-2xl mt-3 mb-2">50% Deposit</h3>
                    <p className="text-[#4A5149] text-sm mb-6">The remaining 50% is payable 120 days before arrival.</p>
                    <div className="border-t border-[#BDA878] pt-4 grid grid-cols-2 gap-4">
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

                {/* CANCELLATION TABLE (New Data Table Style) */}
                <h3 className="font-serif text-xl text-[#1B4D3E] mb-4 mt-10">Cancellation Framework</h3>
                <div className="border border-[#E5DFD3] rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1B4D3E] text-white">
                      <tr>
                        <th className="px-6 py-4 font-medium tracking-wide">Timing Before Arrival</th>
                        <th className="px-6 py-4 font-medium tracking-wide">Standard Booking</th>
                        <th className="px-6 py-4 font-medium tracking-wide">Festive Booking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3] bg-white">
                      <tr className="hover:bg-[#FAF7F0] transition-colors">
                        <td className="px-6 py-4">Early Cancellation</td>
                        <td className="px-6 py-4 font-serif text-lg text-[#1B4D3E]">25% Charge</td>
                        <td className="px-6 py-4 font-serif text-lg text-[#1B4D3E]">50% Charge</td>
                      </tr>
                      <tr className="hover:bg-[#FAF7F0] transition-colors">
                        <td className="px-6 py-4">Late Cancellation</td>
                        <td className="px-6 py-4 font-serif text-lg text-red-700">100% Charge</td>
                        <td className="px-6 py-4 font-serif text-lg text-red-700">100% Charge</td>
                      </tr>
                      <tr className="bg-[#F9F9F9] text-xs text-gray-500">
                        <td className="px-6 py-3">Threshold</td>
                        <td className="px-6 py-3">60 days or fewer</td>
                        <td className="px-6 py-3">120 days or fewer</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mt-3">
                  Cancellations must be submitted in writing. Certain third-party suppliers (e.g., private airlines, luxury villas) may have stricter non-refundable policies which will be disclosed in writing prior to payment.
                </p>
              </div>

              {/* 4. INSURANCE */}
              <div id="insurance" className="scroll-mt-24">
                <Badge text="Section 04" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Travel Insurance</h2>
                <p>It is a strict condition of booking that you have comprehensive travel insurance covering medical expenses, repatriation, cancellation, and personal belongings. Peace and Afrova Group Company Ltd is not liable for any costs arising from a lack of adequate insurance.</p>
              </div>

              {/* 5. VISAS */}
              <div id="visas" className="scroll-mt-24">
                <Badge text="Section 05" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Passports & Visas</h2>
                <p>You are solely responsible for ensuring you have a valid passport (with at least 6 months validity) and any necessary visas for travel. We are happy to provide guidance, but we cannot be held responsible if you are denied entry at the border.</p>
              </div>

              {/* 6. PORTAL */}
              <div id="portal" className="scroll-mt-24">
                <Badge text="Section 06" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Guest Portal & Instant Requests</h2>
                <p>Upon booking, you will receive access to your private Guest Portal. You are responsible for keeping your login credentials secure.</p>
                <p className="mt-2">Any concierge requests or upgrades made through the Guest Portal are <strong>requests only</strong>. They do not constitute a confirmed booking until Peace and Afrova provides a formal quotation and the client completes payment.</p>
              </div>

              {/* 7. INCLUSIVE */}
              <div id="inclusive" className="scroll-mt-24">
                <Badge text="Section 07" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Inclusive & Accessible Travel</h2>
                <p className="mb-4">
                  Peace and Afrova is deeply committed to making extraordinary travel accessible to everyone. To ensure we can provide the highest standard of care, the following conditions apply:
                </p>
                <div className="bg-[#FAF7F0] border-l-4 border-[#C9A961] p-5 text-sm text-gray-700 space-y-3">
                  <p><strong>Advance Disclosure:</strong> It is the client's responsibility to inform us in writing at the time of enquiry of any physical, medical, dietary, or cognitive requirements that may affect their travel experience.</p>
                  <p><strong>Supplier Limitations:</strong> While we will make every effort to secure adapted vehicles and accessible rooms, certain third-party properties may have physical limitations (e.g., steep terrain, lack of ramps, or small boats). We will advise you of any known limitations prior to booking.</p>
                  <p><strong>Companionship:</strong> Where necessary, we require clients requiring significant physical assistance to travel with a capable companion. Our team coordinates logistics, but we cannot provide personal medical care.</p>
                </div>
              </div>

              {/* 8. GUARANTEE */}
              <div id="guarantee" className="scroll-mt-24">
                <Badge text="Section 08" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">The Service Guarantee</h2>
                <p>We operate on a "Swiss Precision" promise. If a confirmed transfer or service provided directly by Peace and Afrova is delayed beyond 30 minutes due to our fault, we may issue a Service Credit. This credit is applied to your final invoice or future booking and is not redeemable for cash.</p>
              </div>

              {/* 9. FORCE MAJEURE */}
              <div id="force-majeure" className="scroll-mt-24">
                <Badge text="Section 09" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Force Majeure</h2>
                <p>We cannot accept liability for any changes, delays, or cancellations caused by circumstances beyond our control, including extreme weather (such as cyclones), natural disasters, civil unrest, strikes, pandemics, or government travel restrictions.</p>
              </div>

              {/* 10. LIABILITY */}
              <div id="liability" className="scroll-mt-24">
                <Badge text="Section 10" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Our Liability</h2>
                <p>Peace and Afrova acts as an agent for third-party suppliers. While we carefully vet our partners, we are not liable for any injury, loss, or damage caused by the acts or omissions of these independent third-party suppliers.</p>
              </div>

              {/* 11. LAW */}
              <div id="law" className="scroll-mt-24">
                <Badge text="Section 11" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Governing Law</h2>
                <p>These Terms and Conditions are governed by the laws of the Republic of Mauritius. Any disputes arising will be subject to the exclusive jurisdiction of the Mauritian courts.</p>
              </div>

              {/* CONTACT */}
              <div id="contact" className="pt-8 border-t border-[#E5DFD3] mt-12 scroll-mt-24">
                <Badge text="Contact" />
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