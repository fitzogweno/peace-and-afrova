"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Handshake, CheckCircle, ShieldCheck, Building2, Map } from 'lucide-react'
import { countryCodes } from '../countryCodes'

export default function PartnersPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [appRef, setAppRef] = useState('')

  // Master form state
  const [formData, setFormData] = useState({
    company_name: '', partner_type: '', country: '', website: '', 
    contact_name: '', email: '', country_code: '', phone: '',
    destinations: [] as string[], services: [] as string[], 
    years_in_operation: '', capacity: '', languages: '', introduction: '',
    agree_terms: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayChange = (field: 'destinations' | 'services', value: string) => {
    setFormData(prev => {
      const current = prev[field]
      const updated = current.includes(value) 
        ? current.filter(item => item !== value) 
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  async function handleSubmit() {
    if (!formData.agree_terms) return setErrorMsg("Please agree to the partnership terms.")
    
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (res.ok) {
        setAppRef(data.application_reference)
        setStep(4) // Show success screen
      } else {
        setErrorMsg(data.error || "Failed to submit application.")
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
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-xl font-serif tracking-wide">Group Company Ltd</div>
          </Link>
        </div>
      </nav>

      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex justify-center mb-6">
            <Handshake className="text-[#C9A961]" size={48} strokeWidth={1} />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">Partner Registration</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-[#E5DFD3]">
          
          {/* PROGRESS BAR */}
          {step < 4 && (
            <div className="flex justify-between items-center mb-10 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center bg-white px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold ${step >= num ? 'bg-[#1B4D3E] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {num}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= num ? 'text-[#1B4D3E]' : 'text-gray-400'}`}>
                    {num === 1 ? 'Company' : num === 2 ? 'Profile' : 'Verification'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-200 text-sm text-center">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: COMPANY INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-6 border-b border-[#E5DFD3] pb-4">
                <Building2 className="text-[#C9A961]" />
                <h2 className="font-serif text-2xl text-[#1B4D3E]">Company Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Company Name *</label>
                  <input required name="company_name" value={formData.company_name} onChange={handleChange} type="text" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Partner Category *</label>
                  <select required name="partner_type" value={formData.partner_type} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]">
                    <option value="">Select category...</option>
                    <option value="hotel">Hotels & Resorts</option>
                    <option value="activity">Activities & Excursions</option>
                    <option value="transport">Transport Companies</option>
                    <option value="guide">Tour Guides</option>
                    <option value="agency">Travel Agencies / DMCs</option>
                    <option value="restaurant">Restaurants & Private Dining</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Country of Registration *</label>
                  <input required name="country" value={formData.country} onChange={handleChange} type="text" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Company Website</label>
                  <input name="website" value={formData.website} onChange={handleChange} type="url" placeholder="https://" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Contact Person *</label>
                  <input required name="contact_name" value={formData.contact_name} onChange={handleChange} type="text" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Business Email *</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
              </div>
              <div className="pt-4">
                <button type="button" onClick={() => setStep(2)} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition flex justify-center items-center gap-2">
                  Next: Business Profile <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS PROFILE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-6 border-b border-[#E5DFD3] pb-4">
                <Map className="text-[#C9A961]" />
                <h2 className="font-serif text-2xl text-[#1B4D3E]">Business Profile</h2>
              </div>
              
              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-3 font-medium">Destinations Covered</label>
                <div className="flex gap-4 flex-wrap">
                  {['Mauritius', 'Seychelles', 'Reunion', 'Rodrigues'].map(dest => (
                    <label key={dest} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.destinations.includes(dest)} onChange={() => handleArrayChange('destinations', dest)} className="accent-[#1B4D3E]" />
                      {dest}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-3 font-medium">Services Offered</label>
                <div className="flex gap-4 flex-wrap">
                  {['Transfers', 'Excursions', 'Accommodation', 'Dining', 'Guiding', 'VIP Concierge'].map(srv => (
                    <label key={srv} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.services.includes(srv)} onChange={() => handleArrayChange('services', srv)} className="accent-[#1B4D3E]" />
                      {srv}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Years in Operation</label>
                  <input name="years_in_operation" value={formData.years_in_operation} onChange={handleChange} type="text" placeholder="e.g. 5" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Client Capacity</label>
                  <input name="capacity" value={formData.capacity} onChange={handleChange} type="text" placeholder="e.g. 50/day" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Languages</label>
                  <input name="languages" value={formData.languages} onChange={handleChange} type="text" placeholder="e.g. EN, FR" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Short Company Introduction</label>
                <textarea name="introduction" value={formData.introduction} onChange={handleChange} rows={3} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961] resize-none"></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-[#1B4D3E] text-[#1B4D3E] py-4 text-xs tracking-widest uppercase font-bold hover:bg-gray-50 transition">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition flex justify-center items-center gap-2">Next: Verification <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {/* STEP 3: VERIFICATION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-6 border-b border-[#E5DFD3] pb-4">
                <ShieldCheck className="text-[#C9A961]" />
                <h2 className="font-serif text-2xl text-[#1B4D3E]">Verification & Submission</h2>
              </div>
              
              <div className="bg-[#FAF7F0] border border-[#E5DFD3] p-6 rounded-sm">
                <h4 className="font-bold text-[#1B4D3E] mb-2">Document Uploads</h4>
                <p className="text-sm text-gray-600 mb-4">During the review process, we will request your Business Registration Certificate, Operating Licenses, and Insurance documentation.</p>
                <div className="border-2 border-dashed border-[#E5DFD3] p-6 text-center text-gray-400 text-sm">
                  (Document upload will be requested via email upon initial review)
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agree_terms" checked={formData.agree_terms} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#1B4D3E]" />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I confirm that the information provided is accurate and I agree to the <a href="#" className="text-[#1B4D3E] underline font-medium">Peace and Afrova Partner Terms & Conditions</a>.
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-[#E5DFD3]">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border border-[#1B4D3E] text-[#1B4D3E] py-4 text-xs tracking-widest uppercase font-bold hover:bg-gray-50 transition">Back</button>
                <button type="button" onClick={handleSubmit} disabled={isSubmitting || !formData.agree_terms} className="flex-[2] bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition disabled:opacity-50">
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {step === 4 && (
            <div className="text-center py-12 animate-in zoom-in-95">
              <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
              <h3 className="font-serif text-3xl text-[#1B4D3E] mb-2">Application Received</h3>
              <p className="text-gray-600 mb-6">Thank you for your interest in partnering with Peace and Afrova.</p>
              
              <div className="bg-[#FAF7F0] p-6 border border-[#E5DFD3] max-w-sm mx-auto mb-8">
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Your Application Reference</div>
                <div className="text-2xl font-mono text-[#1B4D3E] font-bold">{appRef}</div>
              </div>

              <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
                Our partnerships team is now reviewing your profile. You will receive an email at <strong>{formData.email}</strong> within 48 hours regarding the next steps.
              </p>
              <Link href="/" className="inline-block bg-[#1B4D3E] text-white px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] transition">
                Return to Website
              </Link>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}