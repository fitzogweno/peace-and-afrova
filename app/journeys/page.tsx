"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Accessibility } from 'lucide-react'

export default function JourneysPage() {
  const journeys = [
    {
      title: 'The Honeymoon Escape',
      duration: '10 Days',
      destination: 'Mauritius',
      type: 'Honeymoon',
      style: 'Luxury',
      activity: 'Romantic Experiences',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
      tag: '01 · ROMANCE',
      desc: 'A romantic island experience combining secluded stays, private dining, ocean adventures and unforgettable moments.'
    },
    {
      title: 'The Family Island Hopper',
      duration: '12 Days',
      destination: 'Mauritius & Rodrigues',
      type: 'Family',
      style: 'Luxury',
      activity: 'Family Experiences',
      image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80',
      tag: '02 · FAMILY',
      desc: 'A thoughtfully designed family adventure combining the luxurious resorts of Mauritius with the untouched, authentic beauty of Rodrigues.'
    },
    {
      title: 'The Private Island Discovery',
      duration: '5 Days',
      destination: 'Mauritius',
      type: 'VIP',
      style: 'Ultra Luxury',
      activity: 'Private Helicopter and Ocean Experiences',
      image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
      tag: '03 · EXCLUSIVE',
      desc: 'An exclusive escape built around scenic flights, private transfers, ocean experiences and extraordinary landscapes.'
    }
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
          <Link href="/" className="text-xs tracking-widest uppercase text-white/70 hover:text-[#C9A961] transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 font-light">
            The Signature Journeys
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-xl text-[#4A4A4A] leading-relaxed font-light">
            Curated inspirations. Entirely your own.
          </p>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-7xl mx-auto space-y-24 mb-24">
          {journeys.map((journey, index) => {
            const params = new URLSearchParams({
              destination: journey.destination,
              journey_type: journey.type,
              duration: journey.duration,
              style: journey.style,
              activity: journey.activity,
            }).toString()

            return (
              <article key={journey.title} className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl">
                    <Image
                      src={journey.image}
                      alt={journey.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                    <div className="absolute top-6 left-6 z-10 bg-[#1B4D3E] text-[#C9A961] px-4 py-2 text-xs font-bold uppercase tracking-widest">
                      {journey.tag}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 text-left">
                  <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-[#777777] font-bold mb-4">
                    <span>{journey.destination}</span>
                    <span className="w-1 h-1 bg-[#C9A961] rounded-full"></span>
                    <span>{journey.duration}</span>
                  </div>
                  <h2 className="font-serif text-4xl text-[#1B4D3E] mb-6">
                    {journey.title}
                  </h2>
                  <p className="text-lg text-[#4A4A4A] font-light leading-relaxed mb-8">
                    {journey.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    <span className="bg-white border border-[#E5DFD3] px-3 py-1 text-[10px] uppercase tracking-widest text-[#777777]">{journey.style}</span>
                    <span className="bg-white border border-[#E5DFD3] px-3 py-1 text-[10px] uppercase tracking-widest text-[#777777]">{journey.type}</span>
                  </div>

                  <Link
                    href={`/bespoke?${params}`}
                    className="inline-flex items-center gap-3 bg-[#1B4D3E] text-white px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-colors"
                  >
                    Design this journey <ArrowRight size={16} />
                  </Link>
                </div>

              </article>
            )
          })}
        </div>
      </section>

      {/* INCLUSIVE JOURNEYS CTA */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto bg-[#1B4D3E] text-white p-10 md:p-16 text-center shadow-2xl">
          <Accessibility className="mx-auto text-[#C9A961] mb-4" size={40} strokeWidth={1} />
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] mb-4 font-bold">Travel is for everyone</div>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Inclusive Journeys</h2>
          <p className="text-white/80 font-light max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Thoughtfully designed travel experiences, tailored around individual accessibility requirements, comfort and preferences.
          </p>
          <Link href="/bespoke?journey_type=Inclusive" className="inline-block border border-[#C9A961] text-[#C9A961] px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition duration-300">
            Plan an Inclusive Journey
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white border-t border-[#E5DFD3]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-6">
            Not quite what you had in mind?
          </h2>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] mb-12 font-light">
            Tell us what you dream of, and we will architect an entirely bespoke itinerary from scratch.
          </p>
          <Link href="/bespoke" className="inline-block bg-[#1B4D3E] text-white px-10 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
            Begin Your Enquiry
          </Link>
        </div>
      </section>

    </main>
  )
}