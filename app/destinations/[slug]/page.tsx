"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Globe, Coins, Clock, Plane, Calendar, CheckCircle, ArrowRight, ShieldCheck, AlertTriangle, Sun, Cloud, CloudRain, Wind, Droplets, CloudSun } from 'lucide-react'
import { supabase } from '../../utils/supabase'

// Hardcoded destination data
const destinationData: Record<string, any> = {
  mauritius: {
    name: 'Mauritius', tag: 'FLAGSHIP DESTINATION',
    hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600',
    desc: 'Tailor-made trips to Mauritius — turquoise lagoons, white sand beaches and lush mountains, crafted by local experts.',
    facts: { capital: 'Port Louis', language: 'EN · FR · Creole', currency: 'Mauritian Rupee', bestTime: 'May – December' },
    included: ['Welcome & greet', 'Arrival transfer', 'Accommodation', 'Dedicated assistance', 'Departure transfer'],
    excluded: ['Flights', 'Tours & excursions', 'Personal expenses']
  },
  rodrigues: {
    name: 'Rodrigues Island', tag: 'AUTHENTIC DESTINATION',
    hero: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1600',
    desc: 'An unspoilt gem with creole soul — untouched lagoons, slow living and warm-hearted locals.',
    facts: { capital: 'Port Mathurin', language: 'EN · FR · Creole', currency: 'Mauritian Rupee', bestTime: 'May – November' },
    included: ['Private transfers', 'Curated boutique stays', 'Dedicated local guide', 'Daily breakfast'],
    excluded: ['Flights to Rodrigues', 'Lunch & Dinner', 'Personal expenses']
  },
  reunion: {
    name: 'Réunion Island', tag: 'INTENSE DESTINATION',
    hero: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1600',
    desc: 'Volcanoes, cirques and dramatic landscapes — a wild playground for hikers, dreamers and adventurers.',
    facts: { capital: 'Saint-Denis', language: 'French', currency: 'Euro (€)', bestTime: 'May – November' },
    included: ['Private mountain guides', 'Boutique lodges', 'All transfers', 'Custom hiking itineraries'],
    excluded: ['Flights', 'Travel insurance', 'Personal gear']
  },
  seychelles: {
    name: 'Seychelles', tag: 'LUXURY PAIRING',
    hero: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600',
    desc: 'Granite boulders, pristine beaches and absolute luxury — the perfect multi-centre pairing with Mauritius.',
    facts: { capital: 'Victoria', language: 'EN · FR · Creole', currency: 'Seychellois Rupee', bestTime: 'April – October' },
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
  const [weather, setWeather] = useState<any>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)

  useEffect(() => {
    async function fetchExps() {
      const { data } = await supabase.from('services').select('*').eq('destination', dest?.name).limit(3)
      if (data) setExperiences(data)
    }
    if (dest) fetchExps()
  }, [dest])

  useEffect(() => {
    async function fetchWeather() {
      setLoadingWeather(true)
      try {
        // CALLING OUR SECURE API INSTEAD OF OPENWEATHER DIRECTLY
        const res = await fetch(`/api/weather?slug=${slug}`)
        const data = await res.json()
        if (res.ok) setWeather(data)
      } catch (err) {
        console.error("Failed to fetch weather", err)
      } finally {
        setLoadingWeather(false)
      }
    }
    fetchWeather()
  }, [slug])

  async function handleQuickInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'),
          party_size: formData.get('people'), travel_start: formData.get('date'),
          destination: dest.name, interests: `Quick Inquiry: ${formData.get('message')}`
        })
      })
      router.push('/bespoke/thank-you')
    } catch (err) {
      alert("Something went wrong.")
      setIsSubmitting(false)
    }
  }

  const getWeatherIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear': return <Sun size={64} className="text-[#C9A961] drop-shadow-md" />
      case 'clouds': return <Cloud size={64} className="text-gray-400 drop-shadow-md" />
      case 'rain':
      case 'drizzle': return <CloudRain size={64} className="text-blue-400 drop-shadow-md" />
      default: return <CloudSun size={64} className="text-[#C9A961] drop-shadow-md" />
    }
  }

  if (!dest) return <div className="min-h-screen flex items-center justify-center">Destination not found.</div>

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      <nav className="bg-[#1B4D3E] px-6 py-8 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-12">
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden shadow-2xl">
            <img src={dest.hero} alt={dest.name} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 bg-[#C9A961] text-[#1B4D3E] text-xs font-bold px-4 py-2 tracking-widest uppercase rounded-sm">{dest.tag}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#3D8B8B] font-bold mb-4"><MapPin size={16} /> Indian Ocean · REF: DEST-{slug.toUpperCase().slice(0,2)}-01</div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 leading-tight">Holidays to <span className="italic text-[#3D8B8B]">{dest.name}</span></h1>
            <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">{dest.desc}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(dest.facts).map(([key, val]) => (
              <div key={key} className="bg-white p-4 border border-[#E5DFD3] flex items-center gap-3">
                <div className="text-[#3D8B8B]">
                  {key === 'capital' ? <MapPin size={20}/> : key === 'language' ? <Globe size={20}/> : key === 'currency' ? <Coins size={20}/> : <Clock size={20}/>}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{key}</div>
                  <div className="font-medium text-[#1B4D3E]">{val as string}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-6 border-b border-[#E5DFD3] pb-4">Signature Experiences in {dest.name}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {experiences.map((exp) => (
                <Link href={`/bespoke?activity=${encodeURIComponent(exp.name)}`} key={exp.id} className="group bg-white border border-[#E5DFD3] hover:shadow-md transition">
                  <div className="aspect-[16/9] overflow-hidden relative"><img src={exp.image_url} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-[#3D8B8B] font-bold mb-1">{exp.category}</div>
                    <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">{exp.name}</h3>
                    <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-[#E5DFD3]">
                      <span className="text-gray-500">From</span><span className="font-bold text-[#1B4D3E]">Rs {(exp.sell_price * 1.15).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          
          {/* UPDATED WEATHER WIDGET */}
          <div className="bg-white rounded-xl shadow-lg border border-[#E5DFD3] p-6 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none"><CloudSun size={140} className="text-[#1B4D3E]" /></div>
            <div className="relative z-10">
              <div className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] font-bold mb-4 flex items-center gap-2"><MapPin size={14} /> Today's Weather in {dest.name}</div>
              
              {loadingWeather ? (
                <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>
              ) : weather ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-6xl font-serif text-[#1B4D3E] flex items-baseline">{Math.round(weather.temp)}<span className="text-3xl text-gray-400">°C</span></div>
                      <div className="text-sm text-gray-500 capitalize font-medium mt-1">{weather.description}</div>
                    </div>
                    {getWeatherIcon(weather.main)}
                  </div>
                  
                  {/* UPDATED: 3-Column Grid for Weather Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-[#E5DFD3] pt-5 mt-2">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Droplets size={12} className="text-[#3D8B8B]"/> Humidity</div>
                      <div className="text-sm font-bold text-[#1B4D3E]">{weather.humidity}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Wind size={12} className="text-[#3D8B8B]"/> Wind</div>
                      <div className="text-sm font-bold text-[#1B4D3E]">{weather.wind} m/s</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CloudRain size={12} className="text-[#3D8B8B]"/> Rain</div>
                      <div className="text-sm font-bold text-[#1B4D3E]">{Math.round(weather.pop * 100)}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-2">Live weather data currently unavailable.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 border border-[#E5DFD3] shadow-xl sticky top-8">
            <div className="text-xs tracking-widest uppercase text-[#3D8B8B] font-bold mb-2">Quick Inquiry</div>
            <h3 className="font-serif text-3xl text-[#1B4D3E] mb-2">Plan my <span className="italic">{dest.name}</span> trip</h3>
            <form onSubmit={handleQuickInquiry} className="space-y-4 mt-6">
              <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Full Name *</label><input required name="name" type="text" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Email *</label><input required name="email" type="email" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Phone *</label><input required name="phone" type="tel" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Travel Date</label><input name="date" type="date" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent text-gray-500" /></div>
                <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Travellers *</label><input required name="people" type="number" min="1" placeholder="2" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
              </div>
              <div><label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Message</label><textarea name="message" rows={3} className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent resize-none"></textarea></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 mt-4">{isSubmitting ? 'Sending...' : 'Receive a Response'}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DestinationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F0E6]">Loading...</div>}>
      <DestinationContent />
    </Suspense>
  )
}