"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, MessageCircle, ChevronDown, Star } from 'lucide-react'
import { supabase } from '../utils/supabase'

export default function ContactPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: faqData } = await supabase.from('faqs').select('*')
      if (faqData) setFaqs(faqData)

      const { data: reviewData } = await supabase.from('reviews').select('*').eq('is_approved', true)
      if (reviewData) setReviews(reviewData)
    }
    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      {/* HEADER */}
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/contact" className="text-[#C9A961]">Contact</Link>
          </div>
        </div>
      </nav>

      {/* CONTACT CARDS */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">Contact Us</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light mb-12">
            Whether you have a question, need a custom itinerary, or are ready to book, our team is here to help.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <Mail className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">Email Us</h3>
            <p className="text-sm text-gray-500 mb-4">For enquiries and proposals.</p>
            <a href="mailto:hello@peaceandafrova.com" className="text-[#3D8B8B] font-medium hover:text-[#1B4D3E] transition">hello@peaceandafrova.com</a>
          </div>
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <MessageCircle className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-4">For instant chat.</p>
            <a href="https://wa.me/23057400125" target="_blank" rel="noopener noreferrer" className="text-[#3D8B8B] font-medium hover:text-[#1B4D3E] transition">+230 5740 0125</a>
          </div>
          <div className="bg-white p-8 text-center shadow-sm border border-[#E5DFD3]">
            <MapPin className="mx-auto mb-6 text-[#C9A961]" size={32} strokeWidth={1.5} />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">Location</h3>
            <p className="text-sm text-gray-500 mb-4">Our registered office.</p>
            <p className="text-[#3D8B8B] font-medium">Curepipe Forest Side,<br/>Mauritius</p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-4">Frequently Asked Questions</h2>
            <div className="w-12 h-px bg-[#C9A961] mx-auto" />
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-[#E5DFD3]">
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-[#1B4D3E] hover:bg-[#FAF7F0] transition"
                >
                  {faq.question}
                  <ChevronDown size={20} className={`transform transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === faq.id && (
                  <div className="p-4 bg-[#FAF7F0] text-gray-600 text-sm leading-relaxed border-t border-[#E5DFD3]">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCROLLING REVIEWS SECTION */}
      <section className="py-20 bg-[#F5F0E6] overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-[#1B4D3E] mb-4">What Our Clients Say</h2>
          <div className="w-12 h-px bg-[#C9A961] mx-auto" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          {/* The marquee container */}
          <div className="flex gap-8 w-max animate-review-marquee">
            {reviews.map((review) => (
              <div key={review.id} className="w-[350px] flex-shrink-0 bg-white p-8 shadow-sm border border-[#E5DFD3]">
                <div className="flex gap-1 mb-4 text-[#C9A961]">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 italic mb-6">"{review.review_text}"</p>
                <div className="text-xs tracking-widest uppercase text-[#1B4D3E] font-medium">
                  — {review.client_name}
                </div>
              </div>
            ))}
            {/* We duplicate the reviews so it loops seamlessly */}
            {reviews.map((review) => (
              <div key={`dup-${review.id}`} className="w-[350px] flex-shrink-0 bg-white p-8 shadow-sm border border-[#E5DFD3]">
                <div className="flex gap-1 mb-4 text-[#C9A961]">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 italic mb-6">"{review.review_text}"</p>
                <div className="text-xs tracking-widest uppercase text-[#1B4D3E] font-medium">
                  — {review.client_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-16 px-6 text-center">
        <h3 className="font-serif text-2xl text-[#1B4D3E] mb-4">Ready to start planning?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link href="/bespoke" className="btn-primary">Fill out the Bespoke Form</Link>
          <Link 
            href="/reviews/submit" 
            className="inline-block px-8 py-4 border border-[#1B4D3E] text-[#1B4D3E] text-sm tracking-luxury uppercase hover:bg-[#1B4D3E] hover:text-[#F5F0E6] transition-colors duration-300"
          >
            Leave a Review
          </Link>
        </div>
      </section>
    </main>
  )
}