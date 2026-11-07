"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, X, CheckCircle, Compass, Send, MapPin, Plane, Car, Hotel, Ship, Sparkles, Plus, Users, ArrowUpRight } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useApp } from '../context/AppContext'

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [selectedExp, setSelectedExp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [activeDestination, setActiveDestination] = useState('Mauritius')
  const [activeCategory, setActiveCategory] = useState('All')
  
  const { formatPrice } = useApp()

  // --- ITINERARY BUILDER STATE ---
  const [itinerary, setItinerary] = useState<any[]>([])
  const [isBespokeFormOpen, setIsBespokeFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [numChildren, setNumChildren] = useState(0)

  useEffect(() => {
    async function fetchExperiences() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
      
      if (data) setExperiences(data)
      setLoading(false)
    }
    fetchExperiences()
  }, [])

  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
    const expDest = exp.destination || 'Mauritius';
    const matchesDestination = expDest === activeDestination;
    return matchesCategory && matchesDestination;
  })

  const destinations = [
    { name: 'Mauritius', slug: 'mauritius', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', desc: 'The flagship island. Lush mountains, protected lagoons, and timeless creole hospitality.' },
    { name: 'Seychelles', slug: 'seychelles', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', desc: 'Granite boulders, pristine beaches, and absolute, secluded luxury.' },
    { name: 'Reunion Island', slug: 'reunion', img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800', desc: 'Volcanoes, dramatic cirques, and a wild playground for adventurers.' },
    { name: 'Rodrigues', slug: 'rodrigues', img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800', desc: 'An unspoilt gem with a creole soul, untouched lagoons, and slow living.' }
  ]

  // --- CURATED FALLBACKS (If DB is empty for a destination) ---
  const fallbackExperiences: Record<string, any[]> = {
    'Seychelles': [
      { name: 'Private Island Yacht Charter', category: 'Marine Experience', desc: 'A full day exploring the granite coves of Praslin and La Digue aboard a private luxury yacht with a dedicated crew.', price: '€2,500', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800' },
      { name: 'Mahé Helicopter Transfer', category: 'Aviation', desc: 'Skip the ferry and arrive at your private island resort in ultimate style with a scenic helicopter flight.', price: '€800', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
      { name: 'Secluded Beach Dining', category: 'Private Dining', desc: 'A private chef, a butler, and a candlelit table set on a completely deserted beach under the stars.', price: '€450', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }
    ],
    'Reunion Island': [
      { name: 'Volcano Helicopter Flight', category: 'Aviation', desc: 'Fly directly over the active Piton de la Fournaise and the dramatic cirques of the island.', price: '€325', img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800' },
      { name: 'Private Mountain Guide', category: 'Guiding', desc: 'A full-day guided trek through the lunar landscapes and endemic forests with a local expert.', price: '€250', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
      { name: 'Luxury Spa Retreat', category: 'Wellness', desc: 'Post-hike recovery with a bespoke wellness itinerary at one of Réunion’s finest boutique spas.', price: '€300', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800' }
    ],
    'Rodrigues': [
      { name: 'Île aux Cocos Day Trip', category: 'Excursion', desc: 'A boat trip to a protected islet known for its giant tortoises and birdlife, with a private picnic lunch.', price: '€150', img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800' },
      { name: 'Lagoon Catamaran Cruise', category: 'Marine Experience', desc: 'Sail the pristine, untouched lagoon of Rodrigues with snorkelling stops and fresh local seafood.', price: '€120', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
      { name: 'Port Mathurin Culinary Tour', category: 'Private Dining', desc: 'A guided tasting tour through the local markets and hidden creole kitchens of the capital.', price: '€85', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }
    ]
  }

  const currentFallbacks = fallbackExperiences[activeDestination] || []

  const toggleItinerary = (exp: any) => {
    const exists = itinerary.find(item => item.id === exp.id)
    if (exists) {
      setItinerary(itinerary.filter(item => item.id !== exp.id))
    } else {
      setItinerary([...itinerary, exp])
    }
  }

  async function handleBespokeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    const selectedExperiencesText = itinerary.length > 0 
      ? itinerary.map(item => `${item.name} (${item.category})`).join(', ') 
      : 'No specific experiences selected. Fully bespoke request.'

    const adults = formData.get('adults')
    const children = formData.get('children') || '0'
    const childAges = formData.get('child_ages')
    const familyNeeds = formData.get('family_needs')

    let finalInterests = `JOURNEY REQUEST. Selected Experiences: ${selectedExperiencesText}. General Notes: ${formData.get('message')}`
    
    if (Number(children) > 0) {
      finalInterests += ` | FAMILY DETAILS: ${children} Children. Ages: ${childAges}. Specific Needs: ${familyNeeds}`
    }

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          party_size: `${adults} Adults, ${children} Children`,
          travel_start: formData.get('date'),
          destination: activeDestination,
          interests: finalInterests
        })
      })
      setIsSuccess(true)
      setItinerary([]) 
      setNumChildren(0)
    } catch (err) {
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      {/* NAVIGATION */}
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/destinations" className="hover:text-[#C9A961] transition-colors">Destinations</Link>
            <Link href="/experiences" className="text-[#C9A961]">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2000" alt="Indian Ocean" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D3E]/70 via-[#1B4D3E]/40 to-[#1B4D3E]/80" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mt-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-6 font-bold">The Peace and Afrova Difference</div>
          <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">
            Curated by Journey Designers.
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            We do not just book excursions. We architect complete holidays. Discover our islands below.
          </p>
        </div>
      </section>

      {/* DISCOVER DESTINATIONS */}
      <section className="py-20 px-6 bg-white border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E]">Discover Your Indian Ocean</h2>
            <div className="w-16 h-px bg-[#C9A961] mx-auto mt-4 mb-4" />
            <p className="text-[#777777] font-light">Click an island to explore its dedicated destination guide.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link href={`/destinations/${dest.slug}`} key={dest.name} className="group relative overflow-hidden rounded-sm shadow-md h-80">
                <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D3E] via-[#1B4D3E]/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                  <h3 className="font-serif text-2xl mb-2">{dest.name}</h3>
                  <p className="text-xs text-white/80 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0 mb-4">
                    {dest.desc}
                  </p>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#C9A961] opacity-0 group-hover:opacity-100 transition duration-300">
                    Explore Destination <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE EXPERIENCES */}
      <section id="experiences" className="py-20 px-6 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl text-[#1B4D3E] mb-2">Signature Experiences</h2>
              <p className="text-[#777777] font-light">Select items to add to your custom itinerary wishlist.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              {['All', 'Sea Activities', 'Transport', 'Ancillary'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[10px] tracking-widest uppercase transition ${
                    activeCategory === cat 
                      ? 'bg-[#1B4D3E] text-white' 
                      : 'bg-white border border-[#E5DFD3] text-gray-600 hover:border-[#C9A961]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {destinations.map(dest => (
              <button 
                key={dest.name}
                onClick={() => setActiveDestination(dest.name)}
                className={`px-6 py-2 text-xs tracking-widest uppercase whitespace-nowrap border transition ${
                  activeDestination === dest.name 
                    ? 'bg-[#C9A961] border-[#C9A961] text-[#1B4D3E] font-bold' 
                    : 'bg-transparent border-[#E5DFD3] text-gray-500 hover:border-[#C9A961]'
                }`}
              >
                {dest.name}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-500 font-light">Loading curated experiences...</p>
          ) : filteredExperiences.length > 0 ? (
            
            /* --- DATABASE EXPERIENCES --- */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredExperiences.map((exp) => {
                const isSelected = itinerary.some(item => item.id === exp.id)
                return (
                  <div key={exp.id} className={`group bg-white border transition-all duration-300 flex flex-col overflow-hidden ${isSelected ? 'border-[#C9A961] shadow-lg' : 'border-[#E5DFD3] hover:shadow-xl'}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={exp.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1B4D3E]">{exp.category}</div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-[10px] text-[#3D8B8B] font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={12} /> {activeDestination}</div>
                      <h3 className="font-serif text-2xl text-[#1B4D3E] mb-3">{exp.name}</h3>
                      <p className="text-sm text-gray-600 font-light leading-relaxed mb-6 line-clamp-2">{exp.description || 'A luxurious addition to your bespoke itinerary.'}</p>
                      
                      <div className="mt-auto pt-4 border-t border-[#E5DFD3] flex items-center justify-between">
                        <span className="text-lg font-serif text-[#1B4D3E]">{formatPrice(exp.sell_price)}</span>
                        <button onClick={() => toggleItinerary(exp)} className={`text-xs tracking-widest uppercase transition-colors font-bold flex items-center gap-1 px-3 py-1.5 rounded-sm ${isSelected ? 'bg-[#1B4D3E] text-white' : 'text-[#3D8B8B] hover:text-[#1B4D3E] border border-[#E5DFD3]'}`}>
                          {isSelected ? <><CheckCircle size={14} /> Added</> : <><Plus size={14} /> Add to Itinerary</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          ) : (

            /* --- CURATED FALLBACKS (If DB is empty) --- */
            <div className="animate-in fade-in duration-700">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {currentFallbacks.map((exp, index) => (
                  <div key={index} className="group bg-white border border-[#E5DFD3] flex flex-col overflow-hidden hover:shadow-xl transition duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={exp.img} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      <div className="absolute top-4 left-4 bg-[#1B4D3E] text-[#C9A961] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Signature Request</div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-[10px] text-[#3D8B8B] font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={12} /> {activeDestination}</div>
                      <h3 className="font-serif text-2xl text-[#1B4D3E] mb-3">{exp.name}</h3>
                      <p className="text-sm text-gray-600 font-light leading-relaxed mb-6 line-clamp-2">{exp.desc}</p>
                      
                      <div className="mt-auto pt-4 border-t border-[#E5DFD3] flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-light">From <span className="text-lg font-serif text-[#1B4D3E]">{exp.price}</span></span>
                        <button onClick={() => setIsBespokeFormOpen(true)} className="text-xs tracking-widest uppercase text-[#C9A961] hover:text-[#1B4D3E] transition-colors font-bold flex items-center gap-1">
                          Request Details <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA to Destination Page */}
              <div className="mt-16 bg-white border border-[#E5DFD3] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Want to see more of {activeDestination}?</h3>
                  <p className="text-gray-500 font-light text-sm">Explore our full destination guide, including weather, flight times, and the best time to visit.</p>
                </div>
                <Link 
                  href={`/destinations/${destinations.find(d => d.name === activeDestination)?.slug}`}
                  className="bg-[#1B4D3E] text-white px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap"
                >
                  Explore {activeDestination} Guide
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STICKY ITINERARY BAR */}
      {itinerary.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1B4D3E] text-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 animate-in slide-in-from-bottom-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#C9A961] text-[#1B4D3E] w-8 h-8 rounded-full flex items-center justify-center font-bold">{itinerary.length}</div>
              <div>
                <div className="font-serif text-lg">Your Journey Wishlist</div>
                <div className="text-xs text-white/70">Experiences selected for curation.</div>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={() => setItinerary([])} className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition">Clear</button>
              <button onClick={() => setIsBespokeFormOpen(true)} className="bg-[#C9A961] text-[#1B4D3E] px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-white transition flex-1 md:flex-none">Request This Itinerary</button>
            </div>
          </div>
        </div>
      )}

      {/* BESPOKE MODAL */}
      {(isBespokeFormOpen || isSuccess) && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-8 md:p-12">
            <button onClick={() => { setIsBespokeFormOpen(false); setIsSuccess(false); }} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={24} /></button>

            {isSuccess ? (
              <div className="text-center py-12">
                <CheckCircle size={56} className="text-[#C9A961] mx-auto mb-6" />
                <h3 className="font-serif text-3xl text-[#1B4D3E] mb-4">Your request has been received.</h3>
                <p className="text-gray-600 font-light mb-8">Our Journey Designers are reviewing your preferences and will contact you within 48 hours with a tailored proposal.</p>
                <button onClick={() => { setIsSuccess(false); setIsBespokeFormOpen(false); }} className="bg-[#1B4D3E] text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A961] transition">Close</button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-2 font-bold">Bespoke Travel</div>
                  <h2 className="font-serif text-3xl text-[#1B4D3E]">Design Your Indian Ocean Journey</h2>
                  {itinerary.length > 0 && <p className="text-sm text-[#C9A961] font-medium mt-2">{itinerary.length} experience(s) added to your request.</p>}
                </div>

                <form onSubmit={handleBespokeSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Full Name *</label><input required name="name" type="text" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                    <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Email Address *</label><input required name="email" type="email" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Phone Number *</label><input required name="phone" type="tel" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Preferred Island</label>
                      <select name="destination" value={activeDestination} onChange={(e) => setActiveDestination(e.target.value)} className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent">
                        <option value="Mauritius">Mauritius</option>
                        <option value="Seychelles">Seychelles</option>
                        <option value="Reunion Island">Réunion</option>
                        <option value="Rodrigues">Rodrigues</option>
                      </select>
                    </div>
                    <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Approx. Travel Date</label><input name="date" type="date" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent text-gray-500" /></div>
                  </div>

                  <div className="bg-white p-4 border border-[#E5DFD3]">
                    <h4 className="text-xs tracking-widest uppercase text-[#1B4D3E] font-bold mb-4 flex items-center gap-2"><Users size={14} /> Who is travelling?</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Adults *</label><input required name="adults" type="number" min="1" defaultValue="2" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                      <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Children</label><input name="children" type="number" min="0" value={numChildren} onChange={(e) => setNumChildren(Number(e.target.value))} className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                    </div>

                    {numChildren > 0 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-[#E5DFD3]">
                        <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Children's Ages *</label><input required name="child_ages" type="text" placeholder="e.g., 4 and 7" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                        <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Specific Family Requirements</label><input name="family_needs" type="text" placeholder="e.g., Car seats, cot in room" className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent" /></div>
                      </div>
                    )}
                  </div>

                  <div><label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">Tell us about your dream holiday</label><textarea name="message" rows={3} placeholder="E.g., We are looking for a 10-day family holiday combining luxury villas and kid-friendly dining." className="w-full border-b border-[#E5DFD3] py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A961] bg-transparent resize-none"></textarea></div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                    {isSubmitting ? 'Sending...' : 'Request a Custom Proposal'} <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1B4D3E] text-white/60 py-16 px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center font-light">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">Peace and Afrova</div>
          <div className="font-serif text-lg text-white mb-6">Group Company Ltd</div>
          <p className="text-sm mb-6">Curepipe Forest Side, Mauritius</p>
          <div className="border-t border-white/10 pt-6 text-xs text-white/40">© 2026 Peace and Afrova Group Company Ltd.</div>
        </div>
      </footer>
    </main>
  )
}