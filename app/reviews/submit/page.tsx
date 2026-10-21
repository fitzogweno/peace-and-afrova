"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

export default function SubmitReview() {
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    const res = await fetch('/api/review-submit', {
      method: 'POST',
      body: JSON.stringify({
        client_name: formData.get('client_name'),
        email: formData.get('email'),
        review_text: formData.get('review_text'),
        rating: rating
      })
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      alert("Failed to submit review.")
    }
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] py-24 px-6 font-sans">
      <div className="max-w-xl mx-auto bg-white p-8 md:p-12 shadow-xl border border-[#E5DFD3]">
        {success ? (
          <div className="text-center py-12">
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-4">Thank you!</h2>
            <p className="text-gray-600 mb-8">Your review has been submitted. We have also added you to our exclusive travel newsletter list.</p>
            <Link href="/" className="text-[#C9A961] font-medium underline">Return to Home</Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="font-serif text-4xl text-[#1B4D3E] mb-4">Leave a Review</h1>
              <p className="text-gray-600 text-sm">We would love to hear about your experience with Peace and Afrova.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Your Name *</label>
                  <input required name="client_name" type="text" placeholder="e.g. Sarah & James, UK" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Email Address *</label>
                  <input required name="email" type="email" placeholder="For exclusive offers" className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Rating</label>
                <div className="flex gap-2 text-[#C9A961]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}>
                      <Star size={28} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Your Review *</label>
                <textarea required name="review_text" rows={4} className="w-full border border-[#E5DFD3] p-3 text-sm focus:outline-none focus:border-[#C9A961]"></textarea>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF7F0] p-4 border border-[#E5DFD3]">
                <input type="checkbox" name="newsletter" defaultChecked className="mt-1 accent-[#1B4D3E]" />
                <label className="text-xs text-gray-600 leading-relaxed">
                  I agree to receive exclusive offers, new itinerary announcements, and travel inspiration from Peace and Afrova.
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}