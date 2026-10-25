"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, X, CheckCircle } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useApp } from '../context/AppContext'

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [selectedExp, setSelectedExp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const { formatPrice } = useApp()

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

  const filteredExperiences = activeCategory === 'All' 
    ? experiences 
    : experiences.filter(exp => exp.category === activeCategory)

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo-light.png" alt="Peace and Afrova" className="h-12 w-auto" />
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
            Browse our collection of signature experiences, private transport, and curated sea activities.
          </p>
        </div>
      </section>

      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4">
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

      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading experiences...</p>
          ) : filteredExperiences.length === 0 ? (
            <p className="text-center text-gray-500">No experiences found in this category.</p>
          ) : (
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

      {selectedExp && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setSelectedExp(null)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition">
              <X size={24} className="text-[#1B4D3E]" />
            </button>
            <div className="aspect-video w-full overflow-hidden">
              <img src={selectedExp.image_url} alt={selectedExp.name} className="w-full h-full object-cover" />
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
          <img src="/logo-light.png" alt="Peace and Afrova" className="h-16 w-auto mx-auto mb-6" />
          <p className="text-sm mb-6">Curepipe Forest Side, Mauritius</p>
          <div className="border-t border-white/10 pt-6 text-xs text-white/40">
            © 2026 Peace and Afrova Group Company Ltd.
          </div>
        </div>
      </footer>
    </main>
  )
}