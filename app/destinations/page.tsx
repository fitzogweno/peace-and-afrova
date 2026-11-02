"use client"

import Link from 'next/link'
import { MapPin, ArrowRight, Clock } from 'lucide-react'

export default function DestinationsPage() {
  const destinations = [
    {
      slug: 'mauritius',
      name: 'Mauritius',
      tag: 'FLAGSHIP',
      subtitle: 'Turquoise Lagoons',
      desc: 'The flagship of the Indian Ocean — turquoise lagoons, lush mountains and timeless creole hospitality.',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      duration: '7–14 days',
    },
    {
      slug: 'rodrigues',
      name: 'Rodrigues Island',
      tag: 'AUTHENTIC',
      subtitle: 'The Hidden Emerald',
      desc: 'An unspoilt gem with creole soul — untouched lagoons, slow living and warm-hearted locals.',
      img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800',
      duration: '4–7 days',
    },
    {
      slug: 'reunion',
      name: 'Réunion Island',
      tag: 'INTENSE',
      subtitle: 'The Intense Island',
      desc: 'Volcanoes, cirques and dramatic landscapes — a wild playground for hikers, dreamers and adventurers.',
      img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800',
      duration: '5–10 days',
    },
    {
      slug: 'seychelles',
      name: 'Seychelles',
      tag: 'PAIR',
      subtitle: 'The Luxury Twin',
      desc: 'Granite boulders, pristine beaches and absolute luxury — the perfect multi-centre pairing with Mauritius.',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      duration: '6–10 days',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F0E6] pb-24 font-sans text-[#1A1A1A]">
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/destinations" className="text-[#C9A961]">Destinations</Link>
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Tailor-Made</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-4">Our Destinations</h1>
          <p className="text-lg text-gray-600 max-w-2xl font-light">
            Five islands, one philosophy — handpicked escapes across the Indian Ocean, each with its own personality and rhythm.
          </p>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <Link href={`/destinations/${dest.slug}`} key={dest.slug} className="group block bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5DFD3]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4 bg-[#C9A961] text-[#1B4D3E] text-[10px] font-bold px-3 py-1 tracking-widest uppercase">
                  {dest.tag}
                </div>
                <div className="absolute top-4 right-4 bg-[#1B4D3E]/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin size={12} /> {dest.name}
                </div>
              </div>
              
              <div className="p-8">
                <div className="text-xs tracking-widest uppercase text-[#3D8B8B] mb-2 font-medium">— {dest.subtitle}</div>
                <h2 className="font-serif text-3xl text-[#1B4D3E] mb-4 group-hover:text-[#C9A961] transition-colors">{dest.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{dest.desc}</p>
                
                <div className="flex items-center justify-between border-t border-[#E5DFD3] pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock size={14} /> {dest.duration}
                  </div>
                  <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#1B4D3E] group-hover:text-[#C9A961] transition-colors font-bold">
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}