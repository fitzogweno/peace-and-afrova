"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Clock, HeartHandshake, UserCheck, MapPin, Star, Accessibility } from 'lucide-react'
import { useApp } from './context/AppContext'
import GlobalPreferences from './components/GlobalPreferences'

const JOURNEYS = [
  {
    title: 'The Honeymoon Escape',
    duration: '10 Days',
    destination: 'Mauritius',
    type: 'Honeymoon',
    style: 'Luxury',
    activity: 'Romantic Experiences',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    tag: '01 · ROMANCE'
  },
  {
    title: 'The Family Island Hopper',
    duration: '12 Days',
    destination: 'Multiple Islands',
    type: 'Family',
    style: 'Luxury',
    activity: 'Family Experiences',
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80',
    tag: '02 · FAMILY'
  },
  {
    title: 'The Private Island Discovery',
    duration: '5 Days',
    destination: 'Mauritius',
    type: 'VIP',
    style: 'Ultra Luxury',
    activity: 'Private Helicopter and Ocean Experiences',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    tag: '03 · EXCLUSIVE'
  }
]

const REVIEWS = [
  {
    name: 'Sarah & James',
    location: 'London, UK',
    destination: 'Mauritius',
    rating: 5,
    text: 'An exceptional experience from the moment we arrived. The private transfer was seamless, and our driver was waiting with cold towels. It felt like true Swiss precision in the tropics.',
    occasion: 'Honeymoon'
  },
  {
    name: 'The Henderson Family',
    location: 'Dubai, UAE',
    destination: 'Mauritius & Rodrigues',
    rating: 5,
    text: 'Travelling with three young children is never easy, but Peace & Afrova handled everything. The car seats were ready, the villa was stocked, and the island hopper flight was a dream.',
    occasion: 'Family Holiday'
  },
  {
    name: 'Elena R.',
    location: 'Paris, France',
    destination: 'Seychelles',
    rating: 5,
    text: 'The yacht charter was the highlight of our lives. The crew knew exactly where to take us to avoid the crowds. We didn\'t have to lift a finger.',
    occasion: 'Anniversary'
  }
]

export default function Home() {
  const { t } = useApp()

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A]">
      
      {/* NAVIGATION */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 mt-[32px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* NEW LOGO IMAGE */}
          <Link href="/" className="flex items-center" aria-label="Peace and Afrova Home">
            <Image 
              src="/logo-light.png" 
              alt="Peace and Afrova" 
              width={220} 
              height={60} 
              className="w-auto h-12 md:h-16 object-contain" 
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/destinations" className="hover:text-[#C9A961] transition">Destinations</Link>
            <Link href="/experiences" className="hover:text-[#C9A961] transition">{t('nav.experiences') || 'Experiences'}</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition">{t('nav.bespoke') || 'Bespoke'}</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition">{t('nav.about') || 'About'}</Link>
            <Link href="/partners" className="hover:text-[#C9A961] transition">Travel Trade</Link>

            <div className="border-l border-white/30 pl-8">
              <GlobalPreferences />
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-[calc(100vh-32px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="metadata" 
            className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden" 
            poster="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2000"
          >
            <source src="https://res.cloudinary.com/ey8jd5oe/video/upload/v1792921746/hero.mp4" type="video/mp4" />
          </video>
          <div className="hidden motion-reduce:block absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2000')] bg-cover bg-center" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D3E]/70 via-[#1B4D3E]/40 to-[#1B4D3E]/80" />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mt-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-6 font-bold">Private Island Experiences · Thoughtfully Curated</div>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">The Indian Ocean,<br/>on your own terms.</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-12 font-light leading-relaxed">Discover Mauritius, Seychelles, Reunion Island, and Rodrigues through exceptional private experiences, thoughtfully designed around you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/experiences" className="bg-[#C9A961] text-[#1B4D3E] px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-white transition">Explore Experiences</Link>
            <Link href="/bespoke" className="border border-white text-white px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-white/10 transition">Plan Bespoke Travel</Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-32 px-6 bg-[#F5F0E6]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#777777] mb-6 font-bold">Our Approach</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-8 leading-tight">Your islands. Your pace.</h2>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">Every journey begins with what matters to you. Tell us what you love, and we will coordinate the right experiences through our network of trusted local partners across the Indian Ocean — with the precision of Swiss hospitality and the warmth of island soil.</p>
        </div>
      </section>

      {/* SIGNATURE JOURNEYS */}
      <section className="py-24 px-6 bg-white border-y border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] mb-4 font-bold">The Signature Journeys</div>
            <h2 className="font-serif text-4xl text-[#1B4D3E] mb-4">Curated inspirations. Entirely your own.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {JOURNEYS.map((journey) => {
              const params = new URLSearchParams({ destination: journey.destination, journey_type: journey.type, duration: journey.duration, style: journey.style, activity: journey.activity }).toString()
              return (
                <article key={journey.title} className="group flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-gray-200">
                    <Image 
                      src={journey.image} 
                      alt={journey.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700" 
                    />
                    <div className="absolute top-4 left-4 bg-[#1B4D3E] text-[#C9A961] px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-10">{journey.tag}</div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-[#777777] font-bold mb-2"><span>{journey.destination}</span><span>{journey.duration}</span></div>
                    <h3 className="font-serif text-2xl text-[#1B4D3E] mb-3">{journey.title}</h3>
                    <p className="text-sm text-[#777777] font-light leading-relaxed mb-6 flex-1">A thoughtfully designed journey combining luxury stays, private experiences, and seamless coordination.</p>
                    <Link href={`/bespoke?${params}`} className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#1B4D3E] font-bold border-b border-[#C9A961] pb-1 self-start hover:text-[#C9A961] transition">Design this journey <ArrowRight size={14} /></Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* INCLUSIVE JOURNEYS */}
      <section className="py-24 px-6 bg-[#F5F0E6]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#1B4D3E] text-white overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 relative min-h-[400px]">
              <Image 
                src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&q=80" 
                alt="Accessible boardwalk over the ocean" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover" 
              />
            </div>
            <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#C9A961] mb-6 font-bold">
                <Accessibility size={16} /> Peace and Afrova · Inclusive Journeys
              </div>
              <h2 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">The world belongs to everyone.</h2>
              <p className="text-white/80 font-light leading-relaxed mb-6 text-sm md:text-base">We believe extraordinary travel should be accessible to all. From carefully selected accommodation to thoughtfully arranged experiences, we design journeys around individual needs, preferences and comfort.</p>
              <p className="font-serif italic text-xl text-[#C9A961] mb-10">Travel differently. Experience everything.</p>
              <Link href="/bespoke?journey_type=Inclusive" className="inline-block border border-[#C9A961] text-[#C9A961] px-8 py-4 text-xs tracking-widest uppercase font-bold text-center hover:bg-[#C9A961] hover:text-[#1B4D3E] transition duration-300">Plan an Inclusive Journey</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONCIERGE PROMISE */}
      <section className="py-24 px-6 bg-white border-y border-[#E5DFD3]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] mb-6 font-bold">The Peace and Afrova Standard</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-8">Excellence is in every detail.</h2>
          <p className="text-lg text-[#4A4A4A] font-light max-w-2xl mx-auto mb-16">From your first enquiry to your final departure, every detail matters. Our commitment is to deliver a seamless, considered and personal experience throughout your journey.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="flex flex-col items-center"><Clock className="text-[#C9A961] mb-4" size={32} strokeWidth={1.5} /><h3 className="font-bold text-sm mb-2 uppercase tracking-wider text-[#1B4D3E]">Punctuality</h3><p className="text-xs text-[#777777] leading-relaxed">Carefully coordinated arrivals and transfers.</p></div>
            <div className="flex flex-col items-center"><UserCheck className="text-[#C9A961] mb-4" size={32} strokeWidth={1.5} /><h3 className="font-bold text-sm mb-2 uppercase tracking-wider text-[#1B4D3E]">Personal Attention</h3><p className="text-xs text-[#777777] leading-relaxed">A dedicated approach to every guest.</p></div>
            <div className="flex flex-col items-center"><ShieldCheck className="text-[#C9A961] mb-4" size={32} strokeWidth={1.5} /><h3 className="font-bold text-sm mb-2 uppercase tracking-wider text-[#1B4D3E]">Reliability</h3><p className="text-xs text-[#777777] leading-relaxed">Trusted local partners and clear communication.</p></div>
            <div className="flex flex-col items-center"><HeartHandshake className="text-[#C9A961] mb-4" size={32} strokeWidth={1.5} /><h3 className="font-bold text-sm mb-2 uppercase tracking-wider text-[#1B4D3E]">Care</h3><p className="text-xs text-[#777777] leading-relaxed">Thoughtful attention from beginning to end.</p></div>
          </div>
          <div className="border-t border-[#E5DFD3] pt-10"><p className="font-serif italic text-2xl text-[#C9A961]">"Luxury is not what we promise. It is what you experience."</p></div>
        </div>
      </section>

      {/* GUEST JOURNAL (MARQUEE) */}
      <section className="py-24 bg-[#F5F0E6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A961] mb-4 font-bold">The Guest Journal</div>
          <h2 className="font-serif text-4xl text-[#1B4D3E] mb-4">Experiences that stay with you.</h2>
          <p className="text-[#777777] font-light">A collection of moments and memories shared by our guests.</p>
        </div>
        <div className="relative w-full flex overflow-x-hidden group">
          <div className="flex animate-marquee whitespace-nowrap gap-8 py-4 hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
            {[...REVIEWS, ...REVIEWS].map((review, index) => (
              <div key={index} className="bg-white p-8 border border-[#E5DFD3] shadow-sm flex flex-col w-[350px] md:w-[450px] shrink-0 whitespace-normal transition-transform duration-300 hover:-translate-y-2">
                <div className="flex gap-1 text-[#C9A961] mb-6">{[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                <p className="text-[#4A4A4A] font-light leading-relaxed italic mb-8 flex-1">"{review.text}"</p>
                <div className="border-t border-[#E5DFD3] pt-4">
                  <div className="font-bold text-[#1B4D3E] text-sm">{review.name}</div>
                  <div className="text-xs text-[#777777]">{review.location} · {review.occasion}</div>
                  <div className="text-[10px] text-[#C9A961] uppercase tracking-widest mt-1 font-bold flex items-center gap-1"><MapPin size={10} /> {review.destination}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-white border-t border-[#E5DFD3]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#777777] mb-6 font-bold">Begin</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-6">Plan something exceptional</h2>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] mb-12 font-light">Tell us about your trip, and receive a proposal tailored to your needs.</p>
          <Link href="/bespoke" className="inline-block bg-[#1B4D3E] text-white px-10 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">Begin Your Enquiry</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1B4D3E] text-white/70 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            <div>
              {/* NEW FOOTER LOGO IMAGE */}
              <Link href="/" className="inline-block mb-4">
                <Image 
                  src="/logo-light.png" 
                  alt="Peace and Afrova" 
                  width={200} 
                  height={50} 
                  className="w-auto h-12 object-contain" 
                />
              </Link>
              <p className="text-xs font-light">Curating exceptional Indian Ocean journeys with absolute precision.</p>
            </div>
            
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-4 text-[#C9A961] font-bold">Destinations</div>
              <ul className="space-y-2 text-xs">
                <li><Link href="/destinations/mauritius" className="hover:text-white transition">Mauritius</Link></li>
                <li><Link href="/destinations/rodrigues" className="hover:text-white transition">Rodrigues</Link></li>
                <li><Link href="/destinations/reunion" className="hover:text-white transition">Réunion</Link></li>
                <li><Link href="/destinations/seychelles" className="hover:text-white transition">Seychelles</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-4 text-[#C9A961] font-bold">Company</div>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/journeys" className="hover:text-white transition">Signature Journeys</Link></li>
                <li><Link href="/partners" className="hover:text-white transition">Travel Partners</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-4 text-[#C9A961] font-bold">Contact</div>
              <ul className="space-y-2 text-xs">
                <li>Curepipe Forest Side, Mauritius</li>
                <li>hello@peaceandafrova.com</li>
                <li>+230 5740 0125</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-[10px] text-white/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© 2026 Peace and Afrova Group Company Ltd.</div>
            
            {/* UPDATED LEGAL LINKS WITH DIVIDERS AND HOVER EFFECT */}
            <div className="flex items-center gap-4 tracking-[0.2em] uppercase font-bold">
              <Link href="/policies/terms" className="hover:text-[#C9A961] transition">Terms</Link>
              <span className="text-white/20">|</span>
              <Link href="/policies/privacy" className="hover:text-[#C9A961] transition">Privacy</Link>
              <span className="text-white/20">|</span>
              <Link href="/policies/legal" className="hover:text-[#C9A961] transition">Legal Notice</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}