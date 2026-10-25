"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Handshake } from 'lucide-react'
import { countryCodes } from '../countryCodes'

export default function PartnersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [submissionCount, setSubmissionCount] = useState(0)

  useEffect(() => {
    const today = new Date().toDateString()
    const storedData = localStorage.getItem('partner_submissions')
    if (storedData) {
      const { date, count } = JSON.parse(storedData)
      if (date === today) setSubmissionCount(count)
      else localStorage.setItem('partner_submissions', JSON.stringify({ date: today, count: 0 }))
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('')

    if (submissionCount >= 3) {
      setErrorMsg("You have reached the maximum of 3 submissions per day. Please try again tomorrow.")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      company_name: formData.get('company_name'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      country_code: formData.get('country_code'),
      phone: formData.get('phone'),
      partner_type: formData.get('partner_type'),
      message: formData.get('message')
    }

    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const today = new Date().toDateString()
        const newCount = submissionCount + 1
        localStorage.setItem('partner_submissions', JSON.stringify({ date: today, count: newCount }))
        setSubmissionCount(newCount)
        setSuccess(true)
      } else {
        setErrorMsg("Failed to submit application. Please try again.")
      }
    } catch (err) {
      setErrorMsg("Error submitting form.")
    }
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      <nav className="bg-[#1B4D3E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo-light.png" alt="Peace and Afrova" className="h-12 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex justify-center mb-6">
            <Handshake className="text-[#C9A961]" size={48} strokeWidth={1} />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">Travel Partners</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light mb-12">
            We collaborate with DMCs, hotels, and travel agents worldwide. Register your interest below.
          </p>
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-[#E5DFD3]">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-200 text-sm text-center">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="text-center py-12">
              <h3 className="font-serif text-3xl text-green-800 mb-4">Registration Received</h3>
              <p className="text-gray-600 mb-8">Thank you for your interest in partnering with Peace and Afrova. Our team will contact you shortly.</p>
              <button onClick={() => setSuccess(false)} className="btn-primary">Submit Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Company Name *</label>
                  <input required name="company_name" type="text" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Partner Type *</label>
                  <select required name="partner_type" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition">
                    <option value="">Select type...</option>
                    <option value="DMC">Destination Management Company (DMC)</option>
                    <option value="Hotel">Hotel / Resort</option>
                    <option value="Travel Agent">Travel Agent / Advisor</option>
                    <option value="Other">Other Service Provider</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Contact Person *</label>
                  <input required name="contact_name" type="text" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Email Address *</label>
                  <input 
                    required 
                    name="email" 
                    type="email" 
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    title="Please enter a valid email address (e.g., name@company.com)"
                    className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <select name="country_code" className="w-1/3 border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition">
                    <option value="">Code...</option>
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                    ))}
                  </select>
                  <input 
                    name="phone" 
                    type="tel" 
                    pattern="[0-9]{7,15}" 
                    title="Please enter a valid phone number (7 to 15 digits)"
                    placeholder="Digits only (min 7)"
                    className="w-2/3 border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">How can we collaborate?</label>
                <textarea name="message" rows={4} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition resize-none"></textarea>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isSubmitting || submissionCount >= 3} className="btn-primary w-full disabled:opacity-50">
                  {submissionCount >= 3 ? 'Limit Reached (Try Tomorrow)' : isSubmitting ? 'Submitting...' : 'Submit Partnership Request'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  {3 - submissionCount} submission(s) remaining today.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}