"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

export default function JourneyDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  // Data for the detail pages
  const journeyData: Record<string, any> = {
    'the-honeymoon-escape': {
      title: 'The Honeymoon Escape',
      duration: '10 Days',
      destination: 'Mauritius',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=80',
      desc: 'A romantic island experience combining secluded stays, private dining, ocean adventures and unforgettable moments.',
      itinerary: [
        { day: 'Day 1-3', title: 'Arrival & Northern Coast', desc: 'Private VIP airport transfer to your luxury resort. Spend days relaxing on the pristine northern beaches and enjoying a private sunset catamaran cruise.' },
        { day: 'Day 4-6', title: 'The Wild South', desc: 'Transfer to the south. Experience a private helicopter tour over the Underwater Waterfall at Le Morne. Enjoy a romantic dinner on a secluded beach.' },
        { day: 'Day 7-9', title: 'Secluded Luxury', desc: 'Move to a private villa with a dedicated butler and chef. Days are spent at leisure with couples spa treatments and private yoga sessions.' },
        { day: 'Day 10', title: 'Departure', desc: 'A final relaxed morning before your private chauffeur transports you back to the airport for your departure.' }
      ],
      included: ['Private luxury transfers', '5-star accommodation with breakfast', 'Private helicopter tour', 'Sunset catamaran cruise', 'Dedicated concierge'],
      excluded: ['International flights', 'Travel insurance', 'Lunches & Dinners (unless specified)']
    },
    'the-family-island-hopper': {
      title: 'The Family Island Hopper',
      duration: '12 Days',
      destination: 'Mauritius & Rodrigues',
      image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1600&q=80',
      desc: 'A thoughtfully designed family adventure combining the luxurious resorts of Mauritius with the untouched, authentic beauty of Rodrigues.',
      itinerary: [
        { day: 'Day 1-4', title: 'Mauritius Family Fun', desc: 'Arrival and check-in. Enjoy kid-friendly resort amenities, a private glass-bottom boat tour, and a family cooking class.' },
        { day: 'Day 5-8', title: 'Flight to Rodrigues', desc: 'A short scenic flight to Rodrigues. Check into a boutique eco-lodge. Explore the untouched lagoons, giant tortoises, and enjoy a private island picnic.' },
        { day: 'Day 9-11', title: 'Beach & Nature', desc: 'Family hiking to hidden waterfalls, snorkeling in the protected marine park, and plenty of downtime by the pool.' },
        { day: 'Day 12', title: 'Return', desc: 'Flight back to Mauritius to connect with your international departure.' }
      ],
      included: ['Private family transfers', 'Domestic flights to Rodrigues', 'Family suites/villas', 'Private island picnic', 'Child care services available'],
      excluded: ['International flights', 'Travel insurance', 'Personal expenses']
    },
    'the-private-island-discovery': {
      title: 'The Private Island Discovery',
      duration: '5 Days',
      destination: 'Mauritius',
      image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80',
      desc: 'An exclusive escape built around scenic flights, private transfers, ocean experiences and extraordinary landscapes.',
      itinerary: [
        { day: 'Day 1-2', title: 'Helicopter Arrival', desc: 'Skip the airport traffic. A private helicopter transfers you directly from SSR Airport to your exclusive private island resort.' },
        { day: 'Day 3-4', title: 'Ocean & Air', desc: 'A private yacht charter to explore hidden lagoons, followed by a scenic flight over the Black River Gorges.' },
        { day: 'Day 5', title: 'Departure', desc: 'One last breakfast before your private jet or helicopter transfer back to the airport.' }
      ],
      included: ['Helicopter transfers', 'Private island resort accommodation', 'Private yacht charter', 'Personal butler', 'All gourmet meals'],
      excluded: ['International flights', 'Spa treatments']
    }
  }

  const journey = journeyData[slug]

  if (!journey) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-[#1B4D3E]">Journey not found.</div>
  }

  const enquiryParams = new URLSearchParams({
    destination: journey.destination,
    journey_type: journey.title.includes('Honeymoon') ? 'Honeymoon' : journey.title.includes('Family') ? 'Family' : 'VIP',
    duration: journey.duration,
    activity: journey.title
  }).toString()

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8">
        <Link href="/journeys" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white hover:text-[#C9A961] transition-colors bg-black/30 px-4 py-2 backdrop-blur-sm rounded-sm">
          <ArrowLeft size={16} /> All Journeys
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <Image src={journey.image} alt={journey.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D3E] via-[#1B4D3E]/40 to-black/30" />
        
        <div className="relative z-10 text-center text-white px-6 mt-20 max-w-4xl mx-auto">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-4 font-bold">{journey.destination} · {journey.duration}</div>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">{journey.title}</h1>
          <p className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">{journey.desc}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-16">
        
        {/* LEFT: ITINERARY */}
        <div className="md:col-span-2 space-y-12">
          <div>
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-8 border-b border-[#E5DFD3] pb-4">Suggested Itinerary</h2>
            <div className="space-y-8">
              {journey.itinerary.map((item: any, index: number) => (
                <div key={index} className="flex gap-6">
                  <div className="text-[#C9A961] font-serif text-xl shrink-0 w-20 pt-1">{item.day}</div>
                  <div>
                    <h3 className="font-bold text-[#1B4D3E] mb-2">{item.title}</h3>
                    <p className="text-[#4A4A4A] font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: INCLUSIONS & CTA */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 border border-[#E5DFD3] shadow-sm sticky top-8">
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-6">What's Included</h3>
            <ul className="space-y-3 mb-8">
              {journey.included.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#4A4A4A] font-light">
                  <CheckCircle size={16} className="text-[#3D8B8B] shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>

            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4">Not Included</h3>
            <ul className="space-y-3 mb-8 border-b border-[#E5DFD3] pb-8">
              {journey.excluded.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#777777] font-light">
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>

            <Link
              href={`/bespoke?${enquiryParams}`}
              className="block w-full text-center bg-[#1B4D3E] text-white px-6 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition"
            >
              Design This Journey <ArrowRight size={14} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}