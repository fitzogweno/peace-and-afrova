"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../utils/supabase'

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<any[]>([
    "Special Offer: Book a private catamaran before October 31st and receive a complimentary spa session.",
    "New Route Added: We now offer private transfers from SSR Airport to Le Morne.",
    "Travel Partners: Register your DMC or hotel today to collaborate with us."
  ])

  useEffect(() => {
    async function fetchMarquee() {
      try {
        const { data, error } = await supabase
          .from('marquee_activities')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error) {
          console.error("Marquee Error:", error.message)
          return
        }

        if (data && data.length > 0) {
          // --- 7-DAY ROTATION LOGIC ---
          const ROTATION_START_DATE = new Date('2026-11-01T00:00:00Z').getTime() 
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
          
          const now = Date.now()
          const weeksElapsed = Math.floor((now - ROTATION_START_DATE) / SEVEN_DAYS_MS)
          
          // Modulo (%) ensures continuous looping: 0, 1, 2, 0, 1, 2...
          const activeIndex = Math.abs(weeksElapsed) % data.length 
          const activeItem = data[activeIndex]

          // --- DYNAMIC ROUTING LOGIC ---
          // This ensures clicking the marquee goes to the correct island's landing page
          const getLink = (slug: string) => {
            if (slug.includes('seychelles')) return '/experiences/seychelles-helicopter'
            if (slug.includes('reunion')) return '/experiences/reunion-helicopter'
            return '/experiences/helicopter' // Default to Mauritius
          }

          const featuredMessage = (
            <Link 
              href={getLink(activeItem.slug)} 
              className="flex items-center gap-4 hover:underline cursor-pointer group"
            >
              <span className="font-bold group-hover:text-white transition-colors">
                ✦ FEATURED: {activeItem.title} — {activeItem.subtitle} · FROM €{activeItem.price_shared} PP
              </span>
              <span className="bg-[#1B4D3E] text-white px-4 py-1.5 rounded-sm text-[10px] shadow-md font-bold group-hover:bg-white group-hover:text-[#1B4D3E] transition-colors">
                CLICK TO REQUEST
              </span>
            </Link>
          )

          setMessages(prev => [featuredMessage, ...prev])
        }
      } catch (error) {
        console.error("Catch Error:", error)
      }
    }
    fetchMarquee()
  }, [])

  return (
    <div className="bg-[#C9A961] text-[#1B4D3E] py-2.5 text-xs tracking-widest uppercase overflow-hidden relative z-50 font-medium">
      {/* hover:[animation-play-state:paused] allows the user to hover and click the link */}
      <div className="animate-marquee whitespace-nowrap flex gap-12 hover:[animation-play-state:paused]">
        {messages.concat(messages).map((msg, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#F5F0E6] rounded-full inline-block shrink-0"></span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}