"use client"

import Link from 'next/link'
import { ArrowLeft, Compass, ShieldCheck, Heart, PlaneTakeoff, Key, Sparkles, MapPin } from 'lucide-react'

export default function AboutPage() {
  const destinations = [
    {
      name: 'Mauritius',
      desc: 'Turquoise lagoons, lush mountains, and timeless creole hospitality.',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      link: '/destinations/mauritius'
    },
    {
      name: 'Seychelles',
      desc: 'Granite boulders, pristine beaches, and absolute, secluded luxury.',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      link: '/destinations/seychelles'
    },
    {
      name: 'Réunion Island',
      desc: 'Volcanoes, dramatic cirques, and a wild playground for adventurers.',
      img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800&q=80',
      link: '/destinations/reunion'
    },
    {
      name: 'Rodrigues',
      desc: 'An unspoilt gem with a creole soul, untouched lagoons, and slow living.',
      img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80',
      link: '/destinations/rodrigues'
    },
  ]

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
      <section className="pt-24 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8 font-medium">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 font-light leading-tight">
            The Art of Effortless Travel
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-xl md:text-2xl text-[#4A4A4A] leading-relaxed font-light italic max-w-3xl mx-auto">
            "We don't just book trips. We architect memories that linger long after the tan fades."
          </p>
        </div>
      </section>

      {/* THE CORE PHILOSOPHY */}
      <section className="px-6 py-16 bg-white border-y border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1B4D3E] mb-8">
            The Journey Is Yours. The Arrangements Are Ours.
          </h2>
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light max-w-3xl mx-auto mb-6">
            Wealthy travellers do not pay for the absence of amenities; they pay for the absence of friction. Peace and Afrova Group Company Ltd was founded to eliminate the stress of coordinating different companies for airport transfers, hotels, activities, and departures.
          </p>
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light max-w-3xl mx-auto">
            We operate as a modern, remote-first Destination Management Company (DMC). By acting as your single point of contact, we invest entirely in what matters: <strong className="text-[#1B4D3E] font-medium">our people, our network, and your peace of mind.</strong>
          </p>
        </div>
      </section>

      {/* THE ARRIVAL EXPERIENCE */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-[#1B4D3E]">When You Arrive</h2>
            <p className="text-sm tracking-widest uppercase text-[#C9A961] mt-2 font-bold">The Peace and Afrova Standard</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E5DFD3] flex items-center justify-center mb-6">
                <PlaneTakeoff className="text-[#C9A961]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Seamless Arrival</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From the moment you land, your luggage is handled and your private chauffeur is waiting. No queues, no confusion.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E5DFD3] flex items-center justify-center mb-6">
                <Key className="text-[#C9A961]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Pre-Arranged Perfection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your villa is stocked, your dietary requirements are briefed, and every reservation is confirmed before you even check in.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E5DFD3] flex items-center justify-center mb-6">
                <Sparkles className="text-[#C9A961]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-[#1B4D3E] mb-3">Dedicated Concierge</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                One point of contact is available throughout your journey. If plans change, we fix it before you even notice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS GRID */}
      <section className="px-6 py-16 bg-[#FAF7F0] border-y border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E]">Our Indian Ocean</h2>
            <p className="text-[#777777] mt-2 font-light">Curated journeys across four distinct island personalities.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link key={dest.name} href={dest.link} className="group relative overflow-hidden rounded-sm shadow-md h-80">
                <img 
                  src={dest.img} 
                  alt={dest.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D3E] via-[#1B4D3E]/40 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="font-serif text-2xl mb-2">{dest.name}</h3>
                  <p className="text-xs text-white/80 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {dest.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BLOCK */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto bg-[#1B4D3E] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent"></div>
          
          <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">Arrive as a guest. Leave with memories.</h3>
          <p className="text-ivory/80 leading-relaxed mb-10 font-light max-w-2xl mx-auto text-lg">
            We take care of the Indian Ocean in between. Your accommodation, airport reception, ground transportation, and experiences—thoughtfully coordinated through one company.
          </p>
          <Link href="/bespoke" className="inline-block bg-[#C9A961] text-[#1B4D3E] px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300">
            Begin Your Journey
          </Link>
        </div>
      </section>

    </main>
  )
}