"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Globe, Coins, Clock, Plane, Calendar, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '../../utils/supabase'

// Hardcoded destination data for Swiss Precision
const destinationData: Record<string, any> = {
  mauritius: {
    name: 'Mauritius',
    tag: 'FLAGSHIP DESTINATION',
    hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600',
    desc: 'Tailor-made trips to Mauritius — turquoise lagoons, white sand beaches and lush mountains, crafted by local experts.',
    facts: {
      capital: 'Port Louis',
      language: 'EN · FR · Creole',
      currency: 'Mauritian Rupee',
      bestTime: 'May – December',
      flightTime: '~11h from Paris',
      idealStay: '7 – 14 days'
    },
    included: [
      'Welcome & greet — personal meet-and-greet on arrival.',
      'Arrival transfer — private transfer from the airport to your hotel.',
      'Accommodation — your chosen stay with the meal plan booked.',
      'Dedicated assistance — local support throughout your stay.',
      'Departure transfer — private transfer from your hotel to the airport.'
    ],
    excluded: [
      'Flights — international and domestic airfare.',
      'Tours & excursions — activities arranged on request.',
      'Personal expenses — meals, drinks and extras outside your plan.'
    ]
  },
  rodrigues: {
    name: 'Rodrigues Island',
    tag: 'AUTHENTIC DESTINATION',
    hero: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1600',
    desc: 'An unspoilt gem with creole soul — untouched lagoons, slow living and warm-hearted locals.',
    facts: {
      capital: 'Port Mathurin',
      language: 'EN · FR · Creole',
      currency: 'Mauritian Rupee',
      bestTime: 'May – November',
      flightTime: '1.5h from Mauritius',
      idealStay: '4 – 7 days'
    },
    included: ['Private transfers', 'Curated boutique stays', 'Dedicated local guide', 'Daily breakfast'],
    excluded: ['Flights to Rodrigues', 'Lunch & Dinner', 'Personal expenses']
  },
  reunion: {
    name: 'Réunion Island',
    tag: 'INTENSE DESTINATION',
    hero: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1600',
    desc: 'Volcanoes, cirques and dramatic landscapes — a wild playground for hikers, dreamers and adventurers.',
    facts: {
      capital: 'Saint-Denis',
      language: 'French',
      currency: 'Euro (€)',
      bestTime: 'May – November',
      flightTime: '1.5h from Mauritius',
      idealStay: '5 – 10 days'
    },
    included: ['Private mountain guides', 'Boutique lodges', 'All transfers', 'Custom hiking itineraries'],
    excluded: ['Flights', 'Travel insurance', 'Personal gear']
  },
  seychelles: {
    name: 'Seychelles',
    tag: 'LUXURY PAIRING',
    hero: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600',
    desc: 'Granite boulders, pristine beaches and absolute luxury — the perfect multi-centre pairing with Mauritius.',
    facts: {
      capital: 'Victoria',
      language: 'EN · FR · Creole',
      currency: 'Seychellois Rupee',
      bestTime: 'April – October',
      flightTime: '2.5h from Mauritius',
      idealStay: '6 – 10 days'
    },
    included: ['Private island transfers', 'Luxury resort bookings', 'Dedicated concierge', 'Catamaran day trips'],
    excluded: ['International flights', 'Spa treatments', 'Premium alcohol']
  }
}

function DestinationContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const dest = destinationData[slug]

  const [experiences, setExperiences] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchExps() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('destination', dest.name) // Filter by the destination
        .limit(3) // Just show top 3 on this page
      if (data) setExperiences(data)
    }
    if (dest) fetchExps()
  }, [dest])

  async function handleQuickInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          party_size: formData.get('people'),
          travel_start: formData.get('date'),
          destination: dest.name,
          interests: `Quick Inquiry from ${dest.name} page: ${formData.get('message')}`
        })
      })
      router.push('/bespoke/thank-you')
    } catch (err) {
      alert("Something went wrong.")
      setIsSubmitting(false)
    }
  }

  if (!dest) return <div className="min-h-screen flex items-center justify-center">Destination not found.</div>

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* HEADER */}
      <nav className="bg-[#1B4D3E] px-6 py-8 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
            <img src={dest.hero} alt={dest.name} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 bg-[#C9A961] text-[#1B4D3E] text-xs font-bold px-4 py-2 tracking-widest uppercase rounded-sm">
              {dest.tag}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#3D8B8B] font-bold mb-4">
              <MapPin size={16} /> Indian Ocean · REF: DEST-{slug.toUpperCase().slice(0,2)}-01
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 leading-tight">
              Holidays to <span className="italic text-[#3D8B8B]">{dest.name}</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-light mb-8">
              {dest.desc}
            </p>

            {/* KEY FACTS GRID */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 border border-[#E5DFD3] flex items-center gap-3">
                <MapPin className="text-[#3D8B8B]" size={20} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Capital</div>
                  <div className="font-medium text-[#1B4D3E]">{dest.facts.capital}</div>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#E5DFD3] flex items-center gap-3">
                <Globe className="text-[#3D8B8B]" size={20} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Languages</div>
                  <div className="font-medium text-[#1B4D3E]">{dest.facts.language}</div>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#E5DFD3] flex items-center gap-3">
                <Coins className="text-[#3D8B8B]" size={20} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Currency</div>
                  <div className="font-medium text-[#1B4D3E]">{dest.facts.currency}</div>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#E5DFD3] flex items-center gap-3">
                <Clock className="text-[#3D8B8B]" size={20} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Best Time</div>
                  <div className="font-medium text-[#1B4D3E]">{dest.facts.bestTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INCLUDED / EXCLUDED & STICKY FORM */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* LEFT: INCLUDED/EXCLUDED */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6 border-b border-[#E5DFD3] pb-4">
                <h2 className="font-serif text-3xl text-[#1B4D3E]">Everything you need to know</h2>
                <span className="bg-[#F5F0E6] px-3 py-1 text-xs uppercase tracking-widest text-gray-500 rounded-full border border-[#E5DFD3]">Before Booking</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* INCLUDED */}
                <div className="bg-white p-8 border border-[#E5DFD3] shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="text-green-600" size={20} /></div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">In the Price</div>
                      <h3 className="font-serif text-xl text-[#1B4D3E]">What's included</h3>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {dest.included.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle className="text-[#3D8B8B] mt-0.5 shrink-0" size={16} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* EXCLUDED */}
                <div className="bg-white p-8 border border-[#E5DFD3] shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-red-100 p-2 rounded-full"><ShieldCheck className="text-red-500" size={20} /></div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Bookable on Request</div>
                      <h3 className="font-serif text-xl text-[#1B4D3E]">What's not included</h3>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {dest.excluded.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 rounded-full border border-red-300 flex items-center justify-center mt-0.5 shrink-0">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        </div> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* EXPERIENCES IN THIS DESTINATION */}
            <div>
              <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6 border-b border-[#E5DFD3] pb-4">Signature Experiences in {dest.name}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {experiences.map((exp) => (
                  <Link href={`/bespoke?activity=${encodeURIComponent(exp.name)}`} key={exp.id} className="group bg-white border border-[#E5DFD3] hover:shadow-md transition">
                    <div className="aspect-[16/9] overflow-hidden">
                       <img src={exp.image_url} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] uppercase tracking-widest text-[#3D8B8B] font-bold mb-1">{exp.category}</div>
                      <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">{exp.name}</h3>
                      <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-[#E5DFD3]">
                        <span className="text-gray-500">From</span>
                        <span className="font-bold text-[#1B4D3E]">Rs {(exp.sell_price * 1.15).toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: STICKY QUICK INQUIRY FORM */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white p-8 border border-[#E5DFD3] shadow-lg">
              <div className="text-xs tracking-widest uppercase text-[#3D8B8B] font-bold mb-2">Quick Inquiry</div>
              <h3 className="font-serif text-3xl text-[#1B4D3E] mb-2">Plan my <span className="italic">{dest.name}</span> trip</h3>
              <p className="text-sm text-gray-500 mb-6">Tell us about your dream trip — we'll get back within 48 hours with a personalised itinerary.</p>

              <form onSubmit={handleQuickInquiry} className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Full Name *</label>
                  <input required name="name" type="text" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Email *</label>
                    <input required name="email" type="email" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Phone *</label>
                    <input required name="phone" type="tel" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Travel Date</label>
                    <input name="date" type="date" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent text-gray-500" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Travellers *</label>
                    <input required name="people" type="number" min="1" placeholder="2" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Message</label>
                  <textarea name="message" rows={3} placeholder="Tell us about your ideal trip..." className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent resize-none"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 mt-4">
                  {isSubmitting ? 'Sending...' : 'Receive a Response'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}

export default function DestinationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DestinationContent />
    </Suspense>
  )
}