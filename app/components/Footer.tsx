"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

const Facebook = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
)
const Instagram = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
)
const Linkedin = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
)
const TikTok = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
)

export default function Footer() {
  const [year, setYear] = useState<number | null>(null)
  useEffect(() => { setYear(new Date().getFullYear()) }, [])

  return (
    <footer className="bg-[#1B4D3E] text-white font-sans pt-20 pb-8 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:pr-8">
            <Link href="/" className="inline-block mb-6">
              <div className="bg-white inline-block px-4 py-3 rounded-sm mb-4">
                <div className="text-[#1B4D3E] font-serif text-xl font-bold tracking-wider leading-tight">PEACE & AFROVA</div>
                <div className="text-[#3D8B8B] text-[10px] tracking-[0.2em] uppercase text-center mt-1">Group Company Ltd</div>
              </div>
            </Link>
            <p className="text-[#C9A961] font-serif italic text-lg leading-relaxed mb-6">— Curating exceptional Indian Ocean journeys with absolute precision.</p>
            <p className="text-white/70 text-sm leading-relaxed mb-6 font-light">Peace and Afrova is a Destination Management Company based in Mauritius, specialising in tailor-made, luxury travel across Mauritius, Rodrigues, Réunion, and Seychelles.</p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6"><span className="text-[#C9A961] font-serif italic">— 01</span><h3 className="font-serif text-xl tracking-wide">Destinations</h3></div>
            <ul className="space-y-4 text-sm text-white/70 font-light">
              <li><Link href="/destinations/mauritius" className="hover:text-[#C9A961] transition-colors">Mauritius</Link></li>
              <li><Link href="/destinations/rodrigues" className="hover:text-[#C9A961] transition-colors">Rodrigues</Link></li>
              <li><Link href="/destinations/reunion" className="hover:text-[#C9A961] transition-colors">Réunion</Link></li>
              <li><Link href="/destinations/seychelles" className="hover:text-[#C9A961] transition-colors">Seychelles</Link></li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6"><span className="text-[#C9A961] font-serif italic">— 02</span><h3 className="font-serif text-xl tracking-wide">Explore</h3></div>
            <ul className="space-y-4 text-sm text-white/70 font-light">
              <li><Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Our Experiences</Link></li>
              <li><Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link></li>
              <li><Link href="/experiences/helicopter" className="hover:text-[#C9A961] transition-colors">Helicopter Tours</Link></li>
              <li><Link href="/portal/login" className="hover:text-[#C9A961] transition-colors">Client Portal</Link></li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6"><span className="text-[#C9A961] font-serif italic">— 03</span><h3 className="font-serif text-xl tracking-wide">B2B</h3></div>
            <ul className="space-y-4 text-sm text-white/70 font-light">
              <li><Link href="/partners" className="hover:text-[#C9A961] transition-colors">Travel Partners</Link></li>
              <li><Link href="/partners" className="hover:text-[#C9A961] transition-colors">Become a Partner</Link></li>
              <li><Link href="/about" className="hover:text-[#C9A961] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact & Rates</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-xs text-white/50 text-center lg:text-left">© {year ?? ''} Peace and Afrova Group Company Ltd. — All rights reserved.</div>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-all" aria-label="Facebook"><Facebook size={16} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-all" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-all" aria-label="TikTok"><TikTok size={16} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-all" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a href="https://wa.me/23057400125" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all" aria-label="WhatsApp"><MessageCircle size={16} /></a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/50 uppercase tracking-widest">
            <Link href="/policies/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="text-white/20">|</span>
            <Link href="/policies/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="text-white/20">|</span>
            <Link href="/policies/legal" className="hover:text-white transition-colors">Legal Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}