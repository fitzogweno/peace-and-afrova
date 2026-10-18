import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
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
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/bespoke" className="hover:text-[#C9A961] transition-colors">Bespoke Travel</Link>
            <Link href="/about" className="text-[#C9A961]">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">
            Our Story
          </h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-3xl mx-auto space-y-8 text-lg text-[#4A4A4A] leading-relaxed font-light">
          <p>
            Peace and Afrova Group Company Ltd was born from a simple belief: that travel to Mauritius should be as extraordinary and unique as the island itself. 
          </p>
          <p>
            Based in Curepipe Forest Side, we operate as a full Destination Management Company (DMC). We don't just book tours; we curate experiences. From the moment you land to the moment you depart, every detail is coordinated with Swiss precision and Mauritian warmth.
          </p>
          <p>
            We work exclusively with a vetted network of local partners, private drivers, and expert guides. This allows us to maintain absolute control over the quality of your journey, ensuring that whether you are seeking a private catamaran escape, a culinary adventure, or a bespoke celebration, it is executed flawlessly.
          </p>
          <p>
            As a remote-first operation, we are not bound by a physical office. Our coordinators are available wherever you are, whenever you need them. We handle the logistics, the suppliers, and the emergencies, so you can focus entirely on the experience.
          </p>
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] p-8 mt-12 text-center">
            <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">Our Promise</h3>
            <p className="text-sm">
              Transparent proposals. Vetted partners. One dedicated point of contact. 
              We treat every client as a VVIP.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}