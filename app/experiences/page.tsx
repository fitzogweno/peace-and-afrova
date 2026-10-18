import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function ExperiencesPage() {
  const experiences = [
    {
      title: 'Private Lagoon Escapes',
      category: 'Ocean Adventures',
      desc: 'Catamaran days, dolphin swims, and quiet coves — coordinated around you.',
      img: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    },
    {
      title: 'Island Discovery',
      category: 'Landscapes & Culture',
      desc: 'Seven Coloured Earths, tea routes, and local lunches with a private guide.',
      img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800',
    },
    {
      title: 'Signature Celebrations',
      category: 'Honeymoons & Milestones',
      desc: 'Anniversaries, proposals, and moments designed to be remembered.',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    },
    {
      title: 'Le Morne & The South',
      category: 'Heritage & Nature',
      desc: "Mountain, sea and memory — refined stays in the island's wildest corner.",
      img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800',
    },
    {
      title: 'Culinary Journeys',
      category: 'Food & Wine',
      desc: 'Private chefs, market tours, and tables chosen for the occasion.',
      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    },
    {
      title: 'Wellness Retreats',
      category: 'Restore & Reset',
      desc: 'Spa days, yoga at sunrise, and quiet spaces curated for calm.',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#1A1A1A] font-sans pb-24">
      {/* HEADER */}
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">
              Peace and Afrova
            </div>
            <div className="text-xl font-serif tracking-wide">
              Group Company Ltd
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* PAGE TITLE */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">
            Our Experiences
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">
            Browse our collection of signature journeys. Every experience can be tailored 
            to your exact dates, preferences, and pace.
          </p>
        </div>
      </section>

      {/* EDITORIAL GRID */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {experiences.map((exp) => (
              <div key={exp.title} className="group cursor-pointer">
                {/* Image Container with slow zoom on hover */}
                <div className="aspect-[3/4] overflow-hidden mb-6 relative">
                  <img
                    src={exp.img}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500" />
                </div>
                
                <div className="text-xs tracking-[0.3em] uppercase text-[#3D8B8B] mb-3 font-medium">
                  {exp.category}
                </div>
                
                <h3 className="font-serif text-3xl text-[#1B4D3E] mb-3 font-light group-hover:text-[#C9A961] transition-colors">
                  {exp.title}
                </h3>
                
                <p className="text-sm text-[#4A4A4A] leading-relaxed font-light mb-6">
                  {exp.desc}
                </p>
                
                <Link 
                  href="/bespoke" 
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#1B4D3E] border-b border-[#1B4D3E] pb-1 hover:text-[#C9A961] hover:border-[#C9A961] transition-colors font-medium"
                >
                  Enquire <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1B4D3E] text-white/60 py-16 px-6 mt-24">
        <div className="max-w-7xl mx-auto text-center font-light">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-2 font-medium">
            Peace and Afrova
          </div>
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