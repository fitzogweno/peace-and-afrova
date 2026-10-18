import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      {/* HEADER */}
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">
              Peace and Afrova
            </div>
            <div className="text-xl font-serif tracking-wide">
              Group Company Ltd
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="text-[#C9A961]">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">
            Contact Us
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light mb-12">
            Whether you have a question, need a custom itinerary, or are ready to book, our team is here to help.
          </p>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          
          {/* EMAIL */}
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <Mail className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">Email Us</h3>
            <p className="text-sm text-gray-500 mb-4">For general enquiries and proposals.</p>
            <a href="mailto:hello@peaceandafrova.com" className="text-[#3D8B8B] font-medium hover:text-[#1B4D3E] transition">
              hello@peaceandafrova.com
            </a>
          </div>

          {/* WHATSAPP */}
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <MessageCircle className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-4">For instant chat and urgent assistance.</p>
            <a href="https://wa.me/23057400125" target="_blank" rel="noopener noreferrer" className="text-[#3D8B8B] font-medium hover:text-[#1B4D3E] transition">
              +230 5740 0125
            </a>
          </div>

          {/* LOCATION */}
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <MapPin className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">Location</h3>
            <p className="text-sm text-gray-500 mb-4">Our registered office.</p>
            <p className="text-[#3D8B8B] font-medium">
              Curepipe Forest Side,<br/>Mauritius
            </p>
          </div>

        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h3 className="font-serif text-2xl text-[#1B4D3E] mb-4">Ready to start planning?</h3>
          <Link href="/bespoke" className="inline-block px-10 py-4 bg-[#1B4D3E] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#2A6B58] transition-colors font-medium">
            Fill out the Bespoke Form
          </Link>
        </div>
      </section>
    </main>
  )
}