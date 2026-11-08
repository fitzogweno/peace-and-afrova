import Link from 'next/link'
import { ArrowRight, MailCheck, Compass, Sparkles } from 'lucide-react'

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans">
      
      {/* BRAND HEADER */}
      <nav className="bg-[#1B4D3E] px-6 py-8 text-center">
        <Link href="/" className="text-white inline-block">
          <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">
            Peace and Afrova
          </div>
          <div className="text-xl font-serif tracking-wider mt-1">
            Group Company Ltd
          </div>
        </Link>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center">
        
        {/* HERO IMAGE */}
        <div className="relative w-full h-[40vh] md:h-[50vh] rounded-lg overflow-hidden shadow-2xl mb-12 animate-in fade-in zoom-in-95 duration-700">
          <img 
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2000" 
            alt="Indian Ocean Beach" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1B4D3E] mb-4">
          Your journey begins here.
        </h1>

        <h2 className="font-serif text-xl md:text-2xl italic text-[#C9A961] mb-8">
          Thank you for choosing us.
        </h2>

        <p className="text-[#4A4A4A] text-lg font-light leading-relaxed mb-12 max-w-2xl mx-auto">
          Your enquiry has been successfully received. 
          We look forward to discovering what inspires 
          you and creating an exceptional Indian Ocean 
          experience around your wishes.
        </p>

        <div className="w-full h-px bg-[#E5DFD3] mb-12" />

        {/* WHAT HAPPENS NEXT */}
        <div className="mb-12">
          <h3 className="font-serif text-2xl text-[#1B4D3E] mb-10">
            What happens next?
          </h3>

          <div className="space-y-8 max-w-md mx-auto text-left">
            <div className="flex gap-5 items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E5DFD3] flex items-center justify-center shrink-0 shadow-sm">
                <MailCheck className="text-[#C9A961]" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-[#1B4D3E]">Enquiry received</h4>
                <p className="text-[#777777] text-sm mt-1">Your travel preferences have been shared with our team.</p>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E5DFD3] flex items-center justify-center shrink-0 shadow-sm">
                <Compass className="text-[#C9A961]" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-[#1B4D3E]">Journey design</h4>
                <p className="text-[#777777] text-sm mt-1">We review your requirements and explore the most suitable options.</p>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E5DFD3] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="text-[#C9A961]" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-[#1B4D3E]">Your personalised proposal</h4>
                <p className="text-[#777777] text-sm mt-1">Our team will be in touch within 48 hours to discuss your bespoke journey.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-[#E5DFD3] mb-12" />

        <p className="font-serif italic text-2xl text-[#1B4D3E] mb-10 leading-relaxed">
          Your vision. Our expertise.<br />
          An extraordinary journey.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 w-full md:w-auto bg-[#1B4D3E] text-white px-12 py-5 text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition-colors duration-300 shadow-lg"
        >
          Explore The Indian Ocean
          <ArrowRight size={16} />
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="bg-[#1B4D3E] text-center py-10 px-6">
        <p className="text-[#C9A961] text-[10px] md:text-xs tracking-widest uppercase font-bold mb-3">
          Mauritius · Rodrigues · Seychelles · Réunion · Beyond
        </p>
        <p className="text-white/50 text-xs font-light">
          © 2026 Peace and Afrova Group Company Ltd
        </p>
      </footer>

    </main>
  )
}