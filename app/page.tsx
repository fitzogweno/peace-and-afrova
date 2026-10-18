"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Shield, Users, MessageCircle } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#1A1A1A] font-sans">
      
      {/* SMART NAVIGATION (Transparent at top, solid on scroll) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? 'bg-[#1B4D3E] shadow-lg py-3' : 'bg-transparent py-6'
      }`}>
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
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* IMMERSIVE HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2000')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D3E]/80 via-[#1B4D3E]/30 to-[#1B4D3E]/90" />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mt-12">
          <div className="text-xs tracking-[0.4em] uppercase text-[#C9A961] mb-6 font-light">
            Private Island Experiences
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight font-light">
            Mauritius,<br />on your own terms.
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Discover the island through exceptional private experiences,
            thoughtfully designed around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/experiences" 
              className="px-10 py-4 bg-[#C9A961] text-[#1B4D3E] text-sm tracking-[0.2em] uppercase hover:bg-[#b09552] transition-colors font-medium"
            >
              Explore Experiences
            </Link>
            <Link 
              href="/bespoke" 
              className="px-10 py-4 border border-white/60 text-white text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors font-light"
            >
              Plan Bespoke Travel
            </Link>
          </div>
        </div>
      </section>

      {/* EDITORIAL INTRO */}
      <section className="py-32 px-6 bg-[#F5F0E6]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-6 font-medium">Our Approach</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-8 leading-tight font-light">
            Your island. Your pace.
          </h2>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-10" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">
            Every journey begins with what matters to you. Tell us what you love,
            and we will coordinate the right experiences through our network of
            trusted local partners — with the precision of Swiss hospitality and
            the warmth of Mauritian soil.
          </p>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="py-28 px-6 bg-[#1B4D3E] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-4 font-medium">The Details</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light">
              The details make the difference
            </h2>
            <div className="w-16 h-px bg-[#C9A961] mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <Users className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1} />
              <h3 className="font-serif text-xl mb-3 font-light">Selected Partners</h3>
              <p className="text-sm opacity-70 leading-relaxed font-light">A vetted network of local experts — drivers, guides, hosts.</p>
            </div>
            <div>
              <Shield className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1} />
              <h3 className="font-serif text-xl mb-3 font-light">Clear Proposals</h3>
              <p className="text-sm opacity-70 leading-relaxed font-light">Personalised, itemised, and transparent from the first message.</p>
            </div>
            <div>
              <MapPin className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1} />
              <h3 className="font-serif text-xl mb-3 font-light">Coordinated Travel</h3>
              <p className="text-sm opacity-70 leading-relaxed font-light">Bookings, timings, and logistics handled end to end.</p>
            </div>
            <div>
              <MessageCircle className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1} />
              <h3 className="font-serif text-xl mb-3 font-light">One Point of Contact</h3>
              <p className="text-sm opacity-70 leading-relaxed font-light">A dedicated person, reachable throughout your journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 bg-[#F5F0E6] border-t border-[#E5DFD3]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-6 font-medium">Begin</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-6 font-light">
            Plan something exceptional
          </h2>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-10" />
          <p className="text-lg text-[#4A4A4A] mb-12 font-light">
            Tell us about your trip, and receive a proposal tailored to your needs.
          </p>
          <Link 
            href="/bespoke" 
            className="inline-block px-10 py-4 bg-[#1B4D3E] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#2A6B58] transition-colors font-medium"
          >
            Begin Your Enquiry
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1B4D3E] text-white/60 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">
                Peace and Afrova
              </div>
              <div className="font-serif text-lg text-white font-light">Group Company Ltd</div>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase mb-4 text-white/40 font-medium">Explore</div>
              <ul className="space-y-2 text-sm font-light">
                <li><Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link></li>
                <li><Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase mb-4 text-white/40 font-medium">Legal</div>
              <ul className="space-y-2 text-sm font-light">
                <li><Link href="/policies/terms" className="hover:text-[#C9A961] transition-colors">Terms</Link></li>
                <li><Link href="/policies/privacy" className="hover:text-[#C9A961] transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase mb-4 text-white/40 font-medium">Contact</div>
              <ul className="space-y-2 text-sm font-light">
                <li>Curepipe Forest Side, Mauritius</li>
                <li>hello@peaceandafrova.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-xs text-white/40 flex flex-col md:flex-row justify-between gap-4 font-light">
            <div>© 2026 Peace and Afrova Group Company Ltd.</div>
            <div>VAT Registered · Mauritius</div>
          </div>
        </div>
      </footer>
    </main>
  )
}