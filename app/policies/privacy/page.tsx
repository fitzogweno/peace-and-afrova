"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, FileText, ChevronRight, MessageCircle, Phone, Mail, MapPin, Database } from 'lucide-react'

export default function PrivacyPage() {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))
  }, [])

  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "collect", title: "2. Data We Collect" },
    { id: "use", title: "3. How We Use Data" },
    { id: "sharing", title: "4. Data Sharing" },
    { id: "security", title: "5. Data Security" },
    { id: "rights", title: "6. Your Rights" },
    { id: "contact", title: "Contact Us" },
  ]

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
            <Lock className="text-[#C9A961]" size={28} />
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] font-bold">Privacy & Data</div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Privacy Policy</h1>
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
                  At Peace and Afrova Group Company Ltd ("we", "our", or "us"), we are committed to protecting your privacy and handling your personal data with absolute precision and care.
                </p>
                <p className="mt-3">
                  This Privacy Policy explains how we collect, use, and protect your information when you visit our website, use our Guest Portal, or book a journey with us. We comply with the <strong>Mauritius Data Protection Act (DPA) 2017</strong>.
                </p>
                <div className="mt-6 bg-[#FAF7F0] border-l-4 border-[#C9A961] p-5 text-sm text-gray-600">
                  <strong className="text-[#1B4D3E] block mb-1">Data Controller</strong>
                  Peace and Afrova Group Company Ltd<br/>
                  BRN: <strong>C26240240</strong>
                </div>
              </div>

              {/* 2. DATA WE COLLECT */}
              <div id="collect" className="scroll-mt-24">
                <Badge text="Section 02" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Data We Collect</h2>
                <p className="mb-4">To provide you with a seamless luxury travel experience, we collect various types of information:</p>
                
                <div className="bg-[#1B4D3E] text-[#F5F0E6] p-6 rounded-lg font-mono text-sm shadow-md space-y-4">
                  <div>
                    <span className="text-[#C9A961] font-bold flex items-center gap-2 mb-1"><Database size={14}/> Identity Data</span>
                    Full name, passport details, date of birth, nationality, and TSA/visa information required for travel bookings.
                  </div>
                  <div>
                    <span className="text-[#C9A961] font-bold flex items-center gap-2 mb-1"><Database size={14}/> Contact Data</span>
                    Email address, phone number, and emergency contact details.
                  </div>
                  <div>
                    <span className="text-[#C9A961] font-bold flex items-center gap-2 mb-1"><Database size={14}/> Preference Data</span>
                    Dietary requirements, accessibility needs, and special occasion details provided via the Guest Portal.
                  </div>
                  <div>
                    <span className="text-[#C9A961] font-bold flex items-center gap-2 mb-1"><Database size={14}/> Financial Data</span>
                    Payment records and transaction history. (Note: We do not store full credit card numbers; these are processed by our secure PCI-DSS compliant payment partners).
                  </div>
                </div>
              </div>

              {/* 3. HOW WE USE DATA */}
              <div id="use" className="scroll-mt-24">
                <Badge text="Section 03" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">How We Use Your Data</h2>
                <p className="mb-4">We process your personal data for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 text-[#4A4A4A]">
                  <li><strong>Fulfilling Bookings:</strong> To confirm hotels, transfers, excursions, and secure your travel arrangements.</li>
                  <li><strong>Guest Portal Operations:</strong> To manage your itinerary, process upsell requests, and display your vouchers.</li>
                  <li><strong>Communication:</strong> To send booking confirmations, pre-arrival forms, and respond to concierge requests.</li>
                  <li><strong>Legal Compliance:</strong> To share passenger data with immigration authorities when required.</li>
                  <li><strong>Marketing (Optional):</strong> To send you luxury travel inspiration (you can opt out at any time).</li>
                </ul>
              </div>

              {/* 4. DATA SHARING */}
              <div id="sharing" className="scroll-mt-24">
                <Badge text="Section 04" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Data Sharing</h2>
                <p>
                  We do not sell your personal data. However, to execute your luxury travel itinerary, we must share necessary data with trusted third-party suppliers.
                </p>
                <div className="mt-4 border border-[#E5DFD3] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1B4D3E] text-white">
                      <tr>
                        <th className="px-6 py-4 font-medium">Recipient</th>
                        <th className="px-6 py-4 font-medium">Data Shared</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3] bg-white">
                      <tr>
                        <td className="px-6 py-4 font-medium text-[#1B4D3E]">Hotels & Villas</td>
                        <td className="px-6 py-4 text-gray-600">Name, Passport info, Dietary requirements</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-[#1B4D3E]">Chauffeurs & Airlines</td>
                        <td className="px-6 py-4 text-gray-600">Name, Flight details, Contact number</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-[#1B4D3E]">Payment Processors</td>
                        <td className="px-6 py-4 text-gray-600">Billing details required to process secure payments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. SECURITY */}
              <div id="security" className="scroll-mt-24">
                <Badge text="Section 05" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Data Security</h2>
                <p>
                  We employ enterprise-grade security measures to protect your data. Our Guest Portal uses Secure Socket Layer (SSL) encryption, and database access is strictly restricted to authorized personnel using Multi-Factor Authentication (MFA). 
                </p>
                <div className="mt-4 bg-[#FAF7F0] border-l-4 border-[#C9A961] p-5 text-sm text-gray-700">
                  <strong>Retention:</strong> We retain your personal data only for as long as necessary to fulfill the purposes we collected it for, including satisfying any legal, accounting, or reporting requirements.
                </div>
              </div>

              {/* 6. RIGHTS */}
              <div id="rights" className="scroll-mt-24">
                <Badge text="Section 06" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">Your Rights</h2>
                <p className="mb-4">Under the Mauritius Data Protection Act, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Request access to the personal data we hold about you.</li>
                  <li>Request correction of any inaccurate information.</li>
                  <li>Request erasure of your data (subject to legal retention requirements).</li>
                  <li>Object to or restrict processing (e.g., opting out of marketing).</li>
                </ul>
                <p className="mt-4">To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:hello@peaceandafrova.com" className="text-[#1B4D3E] font-medium underline">hello@peaceandafrova.com</a>.</p>
              </div>

              {/* CONTACT */}
              <div id="contact" className="pt-8 border-t border-[#E5DFD3] mt-12 scroll-mt-24">
                <Badge text="Contact" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-6">Contact Us</h2>
                <p className="mb-6">If you have any questions about this Privacy Policy or how we handle your data, please contact us.</p>
                
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

                  <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                    <p className="text-[10px] tracking-widest uppercase text-[#1B4D3E] font-bold mb-1 flex items-center gap-2">
                      <MapPin size={14} className="text-[#C9A961]" /> Address
                    </p>
                    <span className="text-sm text-gray-600">Curepipe Forest Side, Mauritius</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}