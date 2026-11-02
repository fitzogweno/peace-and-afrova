"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, X, CheckCircle, Compass, Send, CheckCircle2 } from 'lucide-react'
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

  // --- BESPOKE INQUIRY FORM STATE ---
  const [inquiryVibe, setInquiryVibe] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset form state if they switch tabs
  useEffect(() => {
    setIsSuccess(false)
    setInquiryVibe('')
  }, [activeDestination])

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

  // Filter by Destination AND Category
  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
    // If a service has no destination (old data), default it to Mauritius
    const expDest = exp.destination || 'Mauritius';
    const matchesDestination = expDest === activeDestination;
    
    return matchesCategory && matchesDestination;
  })

  // --- INNOVATIVE EMPTY STATE LOGIC ---
  const destinationCopy: Record<string, any> = {
    'Seychelles': {
      title: 'The Luxury Twin',
      desc: 'Granite boulders, pristine beaches, and absolute luxury. Tell us your dream Seychelles itinerary, and our local experts will craft it.',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600',
    },
    'Reunion Island': {
      title: 'The Intense Island',
      desc: 'Volcanoes, cirques, and dramatic landscapes. Whether you want extreme hiking or luxury spa retreats, we will build your perfect Réunion escape.',
      img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1600',
    },
    'Rodrigues': {
      title: 'The Hidden Emerald',
      desc: 'An unspoilt gem with creole soul. If you are looking for slow living, untouched lagoons, and authentic island life, let us curate your journey.',
      img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1600',
    }
  }

  const currentCopy = destinationCopy[activeDestination] || destinationCopy['Seychelles']
  const vibeOptions = ['Honeymoon & Romance', 'Family Escape', 'Ultra-Luxury & Privacy', 'Adventure & Hiking']

  async function handleBespokeInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inquiryVibe) return alert("Please select a travel vibe.")
    
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
          destination: activeDestination,
          interests: `BESPOKE INQUIRY (${activeDestination}): Vibe: ${inquiryVibe}. Notes: ${formData.get('message')}`
        })
      })
      setIsSuccess(true)
    } catch (err) {
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">Our Experiences</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">
            Browse our collection of signature experiences across the Indian Ocean.
          </p>
        </div>
      </section>

      {/* DESTINATION FILTERS */}
      <section className="px-6 mb-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 border-b border-[#E5DFD3] pb-4">
          {['Mauritius', 'Seychelles', 'Reunion Island', 'Rodrigues'].map((dest) => (
            <button
              key={dest}
              onClick={() => setActiveDestination(dest)}
              className={`text-sm tracking-widest uppercase transition-all duration-300 ${
                activeDestination === dest 
                  ? 'text-[#1B4D3E] font-bold border-b-2 border-[#C9A961] pb-4 -mb-[18px]' 
                  : 'text-gray-400 hover:text-[#1B4D3E]'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 pt-6">
          {['All', 'Sea Activities', 'Transport', 'Ancillary'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-xs tracking-widest uppercase transition ${
                activeCategory === cat 
                  ? 'bg-[#1B4D3E] text-white' 
                  : 'bg-white border border-[#E5DFD3] text-gray-600 hover:border-[#C9A961]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* EXPERIENCES GRID OR INNOVATIVE EMPTY STATE */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading experiences...</p>
          ) : filteredExperiences.length === 0 ? (
            
            /* --- THE NEW BESPOKE CURATION HUB --- */
            <div className="bg-white border border-[#E5DFD3] shadow-2xl overflow-hidden grid md:grid-cols-2 animate-in fade-in duration-700">
              
              {/* Left: Image & Copy */}
              <div className="relative min-h-[400px] md:min-h-full">
                <img src={currentCopy.img} alt={activeDestination} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D3E]/90 via-[#1B4D3E]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10 md:p-12 text-white">
                  <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C9A961] font-bold mb-4">
                    <Compass size={16} /> Bespoke Curation
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl mb-4 leading-tight">
                    Your {activeDestination},<br/>Crafted to You.
                  </h2>
                  <p className="text-lg text-white/80 font-light max-w-md">
                    {currentCopy.desc}
                  </p>
                </div>
              </div>

              {/* Right: Interactive Form / Success Message */}
              <div className="p-10 md:p-16 flex flex-col justify-center bg-[#FAF7F0]">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <CheckCircle2 size={56} className="text-[#3D8B8B] mx-auto mb-6" />
                    <h3 className="font-serif text-3xl text-[#1B4D3E] mb-4">Your journey has begun.</h3>
                    <p className="text-gray-600 mb-8 font-light">
                      Our destination experts are already reviewing your preferences for {activeDestination}. Expect a beautifully crafted proposal in your inbox within 48 hours.
                    </p>
                    <button onClick={() => { setIsSuccess(false); setInquiryVibe(''); }} className="text-xs uppercase tracking-widest text-[#3D8B8B] font-bold border-b border-[#3D8B8B] pb-1">
                      Send another request
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif text-3xl text-[#1B4D3E] mb-2">Tell us what you desire.</h3>
                    <p className="text-sm text-gray-500 mb-8">Select your travel style and we will send you a tailored quote.</p>

                    <form onSubmit={handleBespokeInquiry} className="space-y-6">
                      
                      {/* Innovative Style Selector */}
                      <div>
                        <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold block mb-3">What is the vibe of this trip? *</label>
                        <div className="flex flex-wrap gap-2">
                          {vibeOptions.map(style => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setInquiryVibe(style)}
                              className={`px-4 py-2 text-xs border transition-all duration-300 ${
                                inquiryVibe === style 
                                  ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]' 
                                  : 'bg-white text-gray-600 border-[#E5DFD3] hover:border-[#C9A961]'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Full Name *</label>
                          <input required name="name" type="text" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                        </div>
                        <div>
                          <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Email *</label>
                          <input required name="email" type="email" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Phone *</label>
                          <input required name="phone" type="tel" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                        </div>
                        <div>
                          <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Guests *</label>
                          <input required name="people" type="number" min="1" placeholder="2" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Approx. Travel Date</label>
                        <input name="date" type="date" className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent text-gray-500" />
                      </div>

                      <div>
                        <label className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">Anything else we should know?</label>
                        <textarea name="message" rows={2} placeholder="E.g., We love sailing, want a private villa..." className="w-full border-b border-[#E5DFD3] py-2 text-sm focus:outline-none focus:border-[#C9A961] bg-transparent resize-none"></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting || !inquiryVibe} 
                        className="w-full bg-[#C9A961] text-[#1B4D3E] py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#1B4D3E] hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                      >
                        {isSubmitting ? 'Sending Request...' : 'Request My Bespoke Quote'} <Send size={14} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
            
          ) : (
            
            /* --- STANDARD EXPERIENCE GRID (Mauritius) --- */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredExperiences.map((exp) => (
                <div key={exp.id} className="group cursor-pointer flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden mb-6 relative">
                    <img
                      src={exp.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                      alt={exp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500" />
                  </div>
                  
                  <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-3 font-medium">
                    {exp.category}
                  </div>
                  
                  <h3 className="font-serif text-2xl text-[#1B4D3E] mb-3 font-light group-hover:text-[#C9A961] transition-colors">
                    {exp.name}
                  </h3>
                  
                  <div className="flex items-center justify-between border-t border-[#E5DFD3] pt-4 mt-auto">
                    <span className="text-sm text-gray-500">From</span>
                    <span className="text-lg font-serif text-[#1B4D3E]">
                      {formatPrice(exp.sell_price * 1.15)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-4">
                    <button 
                      onClick={() => setSelectedExp(exp)} 
                      className="text-xs tracking-[0.2em] uppercase text-[#1B4D3E] border-b border-[#1B4D3E] pb-1 hover:text-[#C9A961] hover:border-[#C9A961] transition-colors font-medium"
                    >
                      View Details
                    </button>
                    <Link href={`/bespoke?activity=${encodeURIComponent(exp.name)}`} className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#C9A961] transition-colors font-medium flex items-center gap-1">
                      Enquire <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DETAIL MODAL (Kept as is) */}
      {selectedExp && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setSelectedExp(null)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition">
              <X size={24} className="text-[#1B4D3E]" />
            </button>
            
            <div className="aspect-video w-full overflow-hidden">
              <img src={selectedExp.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'} alt={selectedExp.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="p-8 md:p-12">
              <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-2 font-medium">{selectedExp.category}</div>
              <h2 className="font-serif text-4xl text-[#1B4D3E] mb-4">{selectedExp.name}</h2>
              <div className="w-16 h-px bg-[#C9A961] mb-8" />
              
              <p className="text-lg text-gray-700 leading-relaxed mb-8 font-light">{selectedExp.description || 'A luxurious addition to your bespoke itinerary.'}</p>
              
              <h3 className="font-serif text-2xl text-[#1B4D3E] mb-4">What's Included</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {selectedExp.inclusions ? selectedExp.inclusions.split(',').map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-[#C9A961] mt-0.5 flex-shrink-0" />
                    {item.trim()}
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">Contact us for specific inclusions.</p>
                )}
              </div>
              
              <div className="bg-white p-6 border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Starting From</div>
                  <div className="text-2xl font-serif text-[#1B4D3E]">{formatPrice(selectedExp.sell_price * 1.15)}</div>
                </div>
                <Link 
                  href={`/bespoke?activity=${encodeURIComponent(selectedExp.name)}`} 
                  className="bg-[#1B4D3E] text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition"
                  onClick={() => setSelectedExp(null)}
                >
                  Enquire About This
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#1B4D3E] text-white/60 py-16 px-6 mt-24">
        <div className="max-w-7xl mx-auto text-center font-light">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">Peace and Afrova</div>
          <div className="font-serif text-lg text-white mb-6">Group Company Ltd</div>
          <p className="text-sm mb-6">Curepipe Forest Side, Mauritius</p>
          <div className="border-t border-white/10 pt-6 text-xs text-white/40">
            © 2026 Peace and Afrova Group Company Ltd.
          </div>
        </div>
      </footer>
    </main>
  )
}