"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

function BespokeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const activityParam = searchParams.get('activity') || ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/bespoke/thank-you')
      } else {
        alert('Something went wrong. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      alert('Error submitting form.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <nav className="bg-ocean px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-ivory">
            <div className="text-xs tracking-luxury uppercase opacity-90">Peace and Afrova</div>
            <div className="text-lg font-serif tracking-wider">Group Company Ltd</div>
          </Link>
        </div>
      </nav>

      <section className="pt-20 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-lagoon hover:text-ocean transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl text-ocean mb-4">Plan your journey</h1>
            <div className="divider-gold mx-auto mb-6" />
            <p className="text-lg text-charcoal-soft font-light">
              Tell us what you have in mind. We will craft a personalised proposal just for you.
            </p>
          </div>

          {activityParam && (
            <div className="bg-[#FAF7F0] border border-[#C9A961] p-4 mb-8 text-center">
              <p className="text-sm text-[#1B4D3E]">You are enquiring about: <strong className="font-serif text-lg">{activityParam}</strong></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-12 shadow-sm border border-line">
            
            <input type="hidden" name="product_interest" value={activityParam} />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Full Name *</label>
                <input required type="text" name="name" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Email Address *</label>
                <input required type="email" name="email" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">WhatsApp Number *</label>
                <input required type="tel" name="phone" placeholder="+230 ..." className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Country of Residence</label>
                <input type="text" name="country" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Travel Start Date *</label>
                <input required type="date" name="travel_start" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition text-charcoal-soft" />
              </div>
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Number of Travellers *</label>
                <input required type="number" min="1" name="party_size" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            {/* NEW FLIGHT & DIETARY FIELDS */}
            <div className="grid md:grid-cols-2 gap-6 border-t border-line pt-6 mt-6">
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Arrival Flight Number</label>
                <input type="text" name="arrival_flight" placeholder="e.g. MK015" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Departure Flight Number</label>
                <input type="text" name="departure_flight" placeholder="e.g. MK016" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Dietary Requirements</label>
              <input type="text" name="dietary_requirements" placeholder="e.g. Vegan, Nut allergy, Halal" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
            </div>

            {/* HOTEL PREFERENCES */}
            <div className="border-t border-line pt-6 mt-6">
              <h3 className="font-serif text-lg text-ocean mb-4">Hotel Preferences</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Do you have a hotel booked? *</label>
                  <select required name="has_hotel" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition">
                    <option value="no">No, please recommend one for me</option>
                    <option value="yes">Yes, I will provide details below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Hotel Name (If booked)</label>
                  <input type="text" name="hotel_name" placeholder="e.g. Four Seasons" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Budget per Night</label>
                  <select name="hotel_budget" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition">
                    <option value="">Select budget...</option>
                    <option value="luxury">Luxury (5-Star)</option>
                    <option value="premium">Premium (4-Star)</option>
                    <option value="boutique">Boutique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Preferred Location</label>
                  <select name="hotel_location" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition">
                    <option value="">Any location</option>
                    <option value="north">North Coast</option>
                    <option value="west">West Coast</option>
                    <option value="east">East Coast</option>
                    <option value="south">South Coast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Hotel Vibe</label>
                  <select name="hotel_vibe" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition">
                    <option value="">Select vibe...</option>
                    <option value="romantic">Romantic / Honeymoon</option>
                    <option value="family">Family Friendly</option>
                    <option value="wellness">Wellness & Spa</option>
                    <option value="adventure">Adventure & Nature</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">Hotel Address / Google Maps Link (If booked)</label>
                <input type="text" name="hotel_details" placeholder="e.g. Anahita, Beau Champ, or paste a Google Maps link" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            <div className="pt-6">
              <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">What are you looking for?</label>
              <textarea name="interests" rows={4} placeholder="E.g., Private catamaran, Le Morne hike, luxury transfers..." className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition resize-none"></textarea>
            </div>

            <div className="pt-6 text-center">
              <button disabled={isSubmitting} type="submit" className="btn-primary w-full disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default function BespokePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BespokeForm />
    </Suspense>
  )
}