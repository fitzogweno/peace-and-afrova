"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Scale, FileText, ChevronRight, Mail, Phone, MessageCircle, Globe } from 'lucide-react'

export default function LegalNoticePage() {
  const [currentDate, setCurrentDate] = useState('')
  
  // Language Switcher State
  const [lang, setLang] = useState<'EN' | 'FR' | 'ES'>('EN')
  const [showLangMenu, setShowLangMenu] = useState(false)

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))
  }, [])

  // Dictionary for the UI
  const t = {
    EN: {
      title: "Legal Notice",
      subtitle: "Transparency & Identity",
      contents: "Contents",
      sections: [
        { id: "publisher", title: "1. Publisher Identity" },
        { id: "nature", title: "2. Nature of Service" },
        { id: "data", title: "3. Veracity of Data" },
        { id: "use", title: "4. Website Use" },
        { id: "interruptions", title: "5. Service Interruptions" },
        { id: "disclaimer", title: "6. Disclaimer" },
        { id: "ip", title: "7. Intellectual Property" },
        { id: "links", title: "8. Links Policy" },
        { id: "breach", title: "9. Breach & Exclusion" },
        { id: "privacy", title: "10. Personal Data" },
        { id: "mods", title: "11. Modifications" },
        { id: "law", title: "12. Applicable Law" },
      ]
    },
    FR: {
      title: "Mentions Légales",
      subtitle: "Transparence & Identité",
      contents: "Sommaire",
      sections: [
        { id: "publisher", title: "1. Identité de l'Éditeur" },
        { id: "nature", title: "2. Nature du Service" },
        { id: "data", title: "3. Véracité des Données" },
        { id: "use", title: "4. Utilisation du Site" },
        { id: "interruptions", title: "5. Interruptions de Service" },
        { id: "disclaimer", title: "6. Clause de Non-Responsabilité" },
        { id: "ip", title: "7. Propriété Intellectuelle" },
        { id: "links", title: "8. Politique de Liens" },
        { id: "breach", title: "9. Manquement & Exclusion" },
        { id: "privacy", title: "10. Données Personnelles" },
        { id: "mods", title: "11. Modifications" },
        { id: "law", title: "12. Droit Applicable" },
      ]
    },
    ES: {
      title: "Aviso Legal",
      subtitle: "Transparencia e Identidad",
      contents: "Índice",
      sections: [
        { id: "publisher", title: "1. Identidad del Titular" },
        { id: "nature", title: "2. Naturaleza del Servicio" },
        { id: "data", title: "3. Veracidad de los Datos" },
        { id: "use", title: "4. Uso del Sitio Web" },
        { id: "interruptions", title: "5. Interrupciones del Servicio" },
        { id: "disclaimer", title: "6. Exención de Responsabilidad" },
        { id: "ip", title: "7. Propiedad Intelectual" },
        { id: "links", title: "8. Política de Enlaces" },
        { id: "breach", title: "9. Incumplimiento y Exclusión" },
        { id: "privacy", title: "10. Datos Personales" },
        { id: "mods", title: "11. Modificaciones" },
        { id: "law", title: "12. Ley Aplicable" },
      ]
    }
  }

  const activeT = t[lang]

  const Badge = ({ text }: { text: string }) => (
    <span className="inline-block bg-[#1B4D3E] text-[#C9A961] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-sm">
      {text}
    </span>
  )

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* MASSIVE HERO BANNER */}
      <section className="relative bg-[#1B4D3E] pt-12 pb-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Top Bar with Back Button & Language Switcher */}
          <div className="flex justify-between items-center mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white/70 hover:text-[#C9A961] transition">
              <ArrowLeft size={16} /> Back to Home
            </Link>

            {/* Language Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#C9A961] uppercase hover:text-white transition bg-[#12382D] px-4 py-2 rounded-sm border border-[#C9A961]/30"
              >
                <Globe size={14} /> {lang} <ChevronRight size={14} className={`transition-transform ${showLangMenu ? 'rotate-90' : ''}`} />
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-24 bg-white border border-[#E5DFD3] shadow-xl z-50">
                  {['EN', 'FR', 'ES'].map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l as any); setShowLangMenu(false); }}
                      className={`block w-full text-left px-4 py-2 text-xs font-bold tracking-widest hover:bg-[#FAF7F0] hover:text-[#C9A961] transition ${lang === l ? 'text-[#1B4D3E] bg-[#FAF7F0]' : 'text-gray-500'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTERED LOGO & TYPOGRAPHY */}
          <div className="flex flex-col items-center text-center">
            
            {/* LOGO PLACED HERE (Using the light version for the dark background) */}
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

            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="text-[#C9A961]" size={32} />
              <div className="text-[12px] tracking-[0.4em] uppercase text-[#C9A961] font-bold">{activeT.subtitle}</div>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight">
              {activeT.title}
            </h1>
            
            <p className="text-sm text-white/50 mt-8 font-light tracking-wide">Last updated: {currentDate || 'Loading...'}</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pt-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
          <div className="lg:w-1/4">
            <div className="sticky top-12 bg-white p-6 border border-[#E5DFD3] shadow-sm hidden lg:block">
              <h3 className="font-serif text-lg text-[#1B4D3E] mb-4 flex items-center gap-2 border-b border-[#E5DFD3] pb-2">
                <FileText size={18} className="text-[#C9A961]" /> {activeT.contents}
              </h3>
              <ul className="space-y-3 text-sm">
                {activeT.sections.map((section) => (
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
              
              {/* 1. PUBLISHER */}
              <div id="publisher" className="scroll-mt-24">
                <Badge text="Section 01" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[0].title}</h2>
                <p className="mb-6">
                  This website is published and operated by Peace and Afrova Group Company Ltd, a luxury Destination Management Company registered in the Republic of Mauritius. 
                </p>
                <div className="bg-[#FAF7F0] border-l-4 border-[#C9A961] p-6 text-sm text-gray-700 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-[#1B4D3E] block mb-1">Company Name</strong>
                      Peace and Afrova Group Company Ltd
                    </div>
                    <div>
                      <strong className="text-[#1B4D3E] block mb-1">Business Registration No. (BRN)</strong>
                      C26240240
                    </div>
                    <div>
                      <strong className="text-[#1B4D3E] block mb-1">Tax Account Number (TAN)</strong>
                      28593850
                    </div>
                    <div>
                      <strong className="text-[#1B4D3E] block mb-1">Registered Address</strong>
                      Curepipe Forest Side, Mauritius
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#E5DFD3] mt-3">
                    <strong className="text-[#1B4D3E] block mb-1">Contact</strong>
                    Email: <a href="mailto:hello@peaceandafrova.com" className="text-[#3D8B8B] hover:underline">hello@peaceandafrova.com</a> | Phone: +230 5740 0125
                  </div>
                </div>
              </div>

              {/* 2. NATURE OF SERVICE */}
              <div id="nature" className="scroll-mt-24">
                <Badge text="Section 02" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[1].title}</h2>
                <p>
                  Through this Website, Peace and Afrova promotes and facilitates the booking of bespoke luxury travel services, including accommodation, private transfers, excursions, and itinerary management across the Indian Ocean. 
                </p>
                <p className="mt-2 text-sm text-gray-600 italic">
                  Note: All bespoke travel arrangements are subject to availability, supplier confirmation, and the Terms & Conditions of the individual properties and partners. Nothing on this website constitutes a binding travel contract until a formal quotation is accepted and a deposit is paid.
                </p>
              </div>

              {/* 3. VERACITY OF DATA */}
              <div id="data" className="scroll-mt-24">
                <Badge text="Section 03" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[2].title}</h2>
                <p>
                  The user (understood as any natural or legal person interested in our services) is solely responsible for ensuring that the data provided—including passport details, dietary requirements, and accessibility needs—is up-to-date, complete, accurate, and truthful. 
                </p>
                <p className="mt-2">
                  Peace and Afrova Group Company Ltd declines any responsibility for the breach of such requirements, or for issues arising at borders, hotels, or with third-party suppliers due to incorrect information provided by the user.
                </p>
              </div>

              {/* 4. USE OF WEBSITE */}
              <div id="use" className="scroll-mt-24">
                <Badge text="Section 04" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[3].title}</h2>
                <p className="mb-4">
                  The user undertakes at all times to make appropriate use of the resources that Peace and Afrova makes available to them, respecting morality, public order, and current legislation.
                </p>
                <div className="bg-[#1B4D3E] text-[#F5F0E6] p-6 rounded-lg font-mono text-sm shadow-md">
                  <span className="text-[#C9A961] font-bold block mb-2">Strictly Prohibited:</span>
                  The use of screen scraping, web scraping, or any other programming technique that allows the extraction of information, itineraries, or data hosted on this website without express written authorization from Peace and Afrova Group Company Ltd.
                </div>
              </div>

              {/* 5. INTERRUPTIONS */}
              <div id="interruptions" className="scroll-mt-24">
                <Badge text="Section 05" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[4].title}</h2>
                <p>
                  Peace and Afrova does not guarantee that there will not be interruptions or errors in access to the website or the Guest Portal. However, we have a firm commitment to carry out all actions aimed at their prompt restoration or repair, except in cases of force majeure or causes beyond our control (such as global internet outages).
                </p>
              </div>

              {/* 6. DISCLAIMER */}
              <div id="disclaimer" className="scroll-mt-24">
                <Badge text="Section 06" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[5].title}</h2>
                <p className="mb-4">
                  Peace and Afrova acts as an agent for third-party suppliers (hotels, airlines, transport providers). We will not assume any responsibility for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Problems derived from lack of access or internet connectivity on the user's end.</li>
                  <li>Damages caused to the user's hardware or software systems due to viruses or outdated browsers.</li>
                  <li>Actions, omissions, or bankruptcies of third-party suppliers (e.g., airlines cancelling a flight, a hotel overbooking).</li>
                  <li>Disruptions caused by extreme weather (cyclones), strikes, or government restrictions.</li>
                </ul>
              </div>

              {/* 7. INTELLECTUAL PROPERTY */}
              <div id="ip" className="scroll-mt-24">
                <Badge text="Section 07" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[6].title}</h2>
                <p>
                  All elements and content published on this website (images, audio, video, software, texts, logos, color combinations, structure and design) have been created by or licensed to Peace and Afrova Group Company Ltd.
                </p>
                <p className="mt-2">
                  The reproduction, distribution, public communication, and transformation of all or part of the contents of this website, in any medium and by any technical means, is strictly prohibited without prior express written authorization.
                </p>
              </div>

              {/* 8. LINKS */}
              <div id="links" className="scroll-mt-24">
                <Badge text="Section 08" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[7].title}</h2>
                <p>
                  This website may contain links to external websites managed by third parties (e.g., partner hotels or our social media pages). Peace and Afrova does not control, endorse, or assume any responsibility for the content, privacy policies, or practices of these third-party websites.
                </p>
              </div>

              {/* 9. BREACH */}
              <div id="breach" className="scroll-mt-24">
                <Badge text="Section 09" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[8].title}</h2>
                <p>
                  Any breach of these terms of use will be subject to prosecution. Peace and Afrova reserves the right to deny or withdraw access to the Guest Portal, without the need for prior notice, to those users who breach the terms and conditions of use, without prejudice to informing the authorities of any illegal behavior.
                </p>
              </div>

              {/* 10. PERSONAL DATA */}
              <div id="privacy" className="scroll-mt-24">
                <Badge text="Section 10" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[9].title}</h2>
                <p>
                  We are committed to complying with the Mauritius Data Protection Act (2017). We guarantee full compliance with the obligations regarding the processing of your personal data. 
                </p>
                <p className="mt-2">
                  Please refer to our <Link href="/policies/privacy" className="text-[#1B4D3E] font-medium underline hover:text-[#C9A961]">Privacy Policy</Link> for full details on how we collect, protect, and process your information.
                </p>
              </div>

              {/* 11. MODIFICATIONS */}
              <div id="mods" className="scroll-mt-24">
                <Badge text="Section 11" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[10].title}</h2>
                <p>
                  Peace and Afrova may modify the terms determined here at any time, being duly published as they appear here. The validity of the aforementioned terms of use will depend on their exposure and will be in force until they are modified by others duly published.
                </p>
              </div>

              {/* 12. LAW */}
              <div id="law" className="scroll-mt-24">
                <Badge text="Section 12" />
                <h2 className="font-serif text-2xl text-[#1B4D3E] mb-4">{activeT.sections[11].title}</h2>
                <p>
                  These terms of use will be governed by Mauritian law. Any dispute arising in connection with the use of this website shall be subject to the exclusive jurisdiction of the courts of the Republic of Mauritius.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}