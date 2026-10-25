"use client"

import Link from 'next/link'
import { ArrowRight, MapPin, Shield, Users, MessageCircle } from 'lucide-react'
import { useApp } from './context/AppContext'
import GlobalPreferences from './components/GlobalPreferences'

export default function Home() {
  const { t } = useApp()

  return (
    <main className="min-h-screen bg-ivory">
      {/* NAVIGATION */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 mt-[32px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img 
              src="https://res.cloudinary.com/ey8jd5oe/image/upload/v1792926085/logo.png.png" 
              alt="Peace and Afrova" 
              className="h-12 w-auto" 
            />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-ivory text-xs tracking-luxury uppercase">
            <Link href="/experiences" className="hover:text-gold transition">{t('nav.experiences')}</Link>
            <Link href="/bespoke" className="hover:text-gold transition">{t('nav.bespoke')}</Link>
            <Link href="/about" className="hover:text-gold transition">{t('nav.about')}</Link>
            <Link href="/contact" className="hover:text-gold transition">{t('nav.contact')}</Link>
            
            <div className="border-l border-ivory/30 pl-8">
              <GlobalPreferences />
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - CINEMATIC VIDEO BACKGROUND */}
      <section className="relative h-[calc(100vh-32px)] flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2000"
          >
            <source 
              src="https://res.cloudinary.com/ey8jd5oe/video/upload/v1792921746/hero.mp4" 
              type="video/mp4" 
            />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-ocean/70 via-ocean/40 to-ocean/80" />

        <div className="relative z-10 text-center text-ivory px-6 max-w-4xl mt-12">
          <div className="label-luxury text-gold mb-6">
            {t('hero.badge')}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight whitespace-pre-line">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/experiences" className="btn-gold">
              {t('hero.cta_primary')}
            </Link>
            <Link href="/bespoke" className="btn-outline">
              {t('hero.cta_secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-32 px-6 bg-ivory">
        <div className="max-w-3xl mx-auto text-center">
          <div className="label-luxury mb-6">Our Approach</div>
          <h2 className="font-serif text-4xl md:text-5xl text-ocean mb-8 leading-tight">
            Your island. Your pace.
          </h2>
          <div className="divider-gold mx-auto mb-8" />
          <p className="text-lg text-charcoal-soft leading-relaxed font-light">
            Every journey begins with what matters to you. Tell us what you love,
            and we will coordinate the right experiences through our network of
            trusted local partners — with the precision of Swiss hospitality and
            the warmth of Mauritian soil.
          </p>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-28 px-6 bg-ocean text-ivory">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="label-luxury text-gold mb-4">The Details</div>
            <h2 className="font-serif text-4xl md:text-5xl">
              The details make the difference
            </h2>
            <div className="divider-gold mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <Users className="mx-auto mb-6 text-gold" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Selected Partners</h3>
              <p className="text-sm opacity-70 leading-relaxed">A vetted network of local experts — drivers, guides, hosts.</p>
            </div>
            <div>
              <Shield className="mx-auto mb-6 text-gold" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Clear Proposals</h3>
              <p className="text-sm opacity-70 leading-relaxed">Personalised, itemised, and transparent from the first message.</p>
            </div>
            <div>
              <MapPin className="mx-auto mb-6 text-gold" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Coordinated Travel</h3>
              <p className="text-sm opacity-70 leading-relaxed">Bookings, timings, and logistics handled end to end.</p>
            </div>
            <div>
              <MessageCircle className="mx-auto mb-6 text-gold" size={32} strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">One Point of Contact</h3>
              <p className="text-sm opacity-70 leading-relaxed">A dedicated person, reachable throughout your journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-ivory-warm border-t border-line">
        <div className="max-w-3xl mx-auto text-center">
          <div className="label-luxury mb-6">Begin</div>
          <h2 className="font-serif text-4xl md:text-5xl text-ocean mb-6">
            Plan something exceptional
          </h2>
          <div className="divider-gold mx-auto mb-8" />
          <p className="text-lg text-charcoal-soft mb-12 font-light">
            Tell us about your trip, and receive a proposal tailored to your needs.
          </p>
          <Link href="/bespoke" className="btn-primary">
            Begin Your Enquiry
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ocean text-ivory/70 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img 
                src="https://res.cloudinary.com/ey8jd5oe/image/upload/v1792926085/logo.png.png" 
                alt="Peace and Afrova" 
                className="h-16 w-auto mb-4" 
              />
            </div>
            <div>
              <div className="text-xs tracking-luxury uppercase mb-4 text-ivory/50">Explore</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/experiences" className="hover:text-gold transition">Experiences</Link></li>
                <li><Link href="/bespoke" className="hover:text-gold transition">Bespoke Travel</Link></li>
                <li><Link href="/careers" className="hover:text-gold transition">Careers</Link></li>
                <li><Link href="/partners" className="hover:text-gold transition">Travel Partners</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-luxury uppercase mb-4 text-ivory/50">Legal</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/portal/login" className="hover:text-gold transition">Client Portal</Link></li>
                <li><Link href="/policies/terms" className="hover:text-gold transition">Terms</Link></li>
                <li><Link href="/policies/privacy" className="hover:text-gold transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-luxury uppercase mb-4 text-ivory/50">Contact</div>
              <ul className="space-y-2 text-sm">
                <li>Curepipe Forest Side, Mauritius</li>
                <li>hello@peaceandafrova.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ivory/10 pt-8 text-xs text-ivory/40 flex flex-col md:flex-row justify-between gap-4">
            <div>© 2026 Peace and Afrova Group Company Ltd.</div>
            <div>VAT Registered · Mauritius</div>
          </div>
        </div>
      </footer>
    </main>
  )
}