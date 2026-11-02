"use client"

import Link from 'next/link'
import { ArrowLeft, Compass, ShieldCheck, Heart, MapPin } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* NAVIGATION */}
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/destinations" className="hover:text-[#C9A961] transition-colors">Destinations</Link>
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="text-[#C9A961]">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 font-light leading-tight">
            The Art of Indian Ocean Travel
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-xl text-[#4A4A4A] leading-relaxed font-light italic">
            "We don't just book trips. We architect memories that linger long after the tan fades."
          </p>
        </div>
      </section>

      {/* THE PHILOSOPHY */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg text-[#4A4A4A] leading-relaxed font-light mx-auto space-y-6">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-[#1B4D3E] first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              Peace and Afrova Group Company Ltd was founded on a singular obsession: to redefine luxury travel across the Indian Ocean. We saw a landscape of breathtaking islands—Mauritius, Seychelles, Réunion, and Rodrigues—and realized that the standard tourist experience did not do them justice.
            </p>
            <p>
              We operate as a modern, remote-first Destination Management Company (DMC). By removing the overhead of a traditional brick-and-mortar agency, we invest entirely in what matters: <strong className="text-[#1B4D3E] font-medium">our people, our network, and our clients.</strong>
            </p>
            <p>
              From our roots in Curepipe Forest Side, Mauritius, we have cultivated an exclusive network of vetted local partners, elite drivers, and master guides. We do not rely on third-party aggregators. We shake hands with our suppliers. This allows us to maintain absolute control over the quality of your journey, ensuring that whether you are seeking a private helicopter over the underwater waterfall or a secluded villa in Seychelles, it is executed flawlessly.
            </p>
          </div>
        </div>
      </section>

      {/* THE THREE PILLARS */}
      <section className="px-6 py-16 bg-[#FAF7F0] border-y border-[#E5DFD3]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E]">The Peace and Afrova Standard</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 border border-[#E5DFD3] text-center hover:shadow-lg transition">
              <Compass className="mx-auto text-[#C9A961] mb-4" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Swiss Precision</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every transfer, flight, and reservation is timed to the minute. Our logistics are silent, seamless, and exact.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#E5DFD3] text-center hover:shadow-lg transition">
              <Heart className="mx-auto text-[#C9A961] mb-4" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Mauritian Soul</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We infuse every itinerary with the genuine warmth, creole hospitality, and vibrant culture of our islands.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#E5DFD3] text-center hover:shadow-lg transition">
              <ShieldCheck className="mx-auto text-[#C9A961] mb-4" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Absolute Trust</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transparent pricing. One dedicated point of contact. We treat every client as a VVIP, from enquiry to departure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* OUR PROMISE (CTA BLOCK) */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto bg-[#1B4D3E] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative Gold Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent"></div>
          
          <h3 className="font-serif text-3xl text-white mb-4">Our Promise to You</h3>
          <p className="text-ivory/80 leading-relaxed mb-8 font-light">
            You will never speak to a bot, chase a refund, or wonder where your driver is. When you travel with Peace and Afrova, you are not just a booking number. You are our guest.
          </p>
          <Link href="/bespoke" className="inline-block bg-[#C9A961] text-[#1B4D3E] px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-white transition">
            Begin Your Journey
          </Link>
        </div>
      </section>

    </main>
  )
}