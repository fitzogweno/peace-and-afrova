"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BespokePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      {/* HEADER */}
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

          {/* THE FORM */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-12 shadow-sm border border-line">
            
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
                <label className="block text-xs tracking-luxury uppercase text-ocean mb-2">WhatsApp / Phone</label>
                <input type="text" name="phone" className="w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-gold transition" />
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

            <div>
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