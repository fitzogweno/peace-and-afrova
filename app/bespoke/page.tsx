"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

function BespokeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currency, formatPrice } = useApp()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const activityParam = searchParams.get('activity') || ''
  const totalSteps = 5

  // Base ranges in MUR (AppContext will convert automatically)
  const hotelRanges = [10000, 20000, 40000, 75000]
  const totalRanges = [150000, 250000, 500000, 1000000]

  const [formData, setFormData] = useState({
    destinations: [] as string[],
    journey_type: '',
    occasion: '',
    travel_start: '',
    duration: '',
    adults: '2',
    children: '0',
    child_ages: '',
    has_hotel: 'no',
    hotel_details: '',
    accommodation_type: '',
    hotel_budget: '',
    hotel_location: '',
    experiences: [] as string[],
    needs_transfers: false,
    needs_chauffeur: false,
    arrival_flight: '',
    departure_flight: '',
    dietary_requirements: '',
    mobility_requirements: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    total_budget: '',
    contact_method: 'WhatsApp',
    privacy_consent: false
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

  const handleArrayToggle = (field: 'destinations' | 'experiences', value: string) => {
    setFormData(prev => {
      const current = prev[field]
      const updated = current.includes(value) 
        ? current.filter(item => item !== value) 
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const validateStep = (currentStep: number) => {
    setErrorMsg('')
    if (currentStep === 1) {
      if (formData.destinations.length === 0) return setErrorMsg("Please select at least one destination."), false
      if (!formData.travel_start) return setErrorMsg("Please provide an approximate travel date."), false
    }
    if (currentStep === 5) {
      if (!formData.name || !formData.email || !formData.phone) return setErrorMsg("Please fill in all contact details."), false
      if (!formData.privacy_consent) return setErrorMsg("Please agree to the privacy policy."), false
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, totalSteps))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep(5)) return
    
    setIsSubmitting(true)

    const partySize = `${formData.adults} Adults, ${formData.children} Children`
    const selectedDestinations = formData.destinations.join(', ')
    
    let finalInterests = `JOURNEY TYPE: ${formData.journey_type || 'Not specified'} | OCCASION: ${formData.occasion || 'None'} | DURATION: ${formData.duration || 'TBC'} nights.\n`
    finalInterests += `EXPERIENCES: ${formData.experiences.join(', ') || 'None selected'}.\n`
    if (formData.children !== '0') finalInterests += `CHILDREN AGES: ${formData.child_ages || 'Not provided'}.\n`
    if (formData.arrival_flight) finalInterests += `FLIGHTS: Arr ${formData.arrival_flight} / Dep ${formData.departure_flight}.\n`
    finalInterests += `ARRANGEMENTS: ${formData.needs_transfers ? 'Needs Transfers. ' : ''}${formData.needs_chauffeur ? 'Needs Chauffeur. ' : ''}\n`
    finalInterests += `TOTAL BUDGET: ${formData.total_budget || 'Not specified'}.\n`
    finalInterests += `CONTACT VIA: ${formData.contact_method}.\n`
    if (formData.dietary_requirements) finalInterests += `DIETARY: ${formData.dietary_requirements}.\n`
    if (formData.mobility_requirements) finalInterests += `MOBILITY: ${formData.mobility_requirements}.\n`

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      party_size: partySize,
      travel_start: formData.travel_start,
      destination: selectedDestinations,
      interests: finalInterests,
      has_hotel: formData.has_hotel,
      hotel_details: formData.hotel_details,
      hotel_budget: formData.hotel_budget,
      hotel_location: formData.hotel_location,
      hotel_vibe: formData.accommodation_type, 
      product_interest: activityParam
    }

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // FIXED: Read the JSON response to get the exact error
      const responseData = await res.json()

      if (res.ok) {
        router.push('/bespoke/thank-you')
      } else {
        // Show the exact error from the API!
        setErrorMsg(responseData.error || 'Something went wrong. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error: any) {
      setErrorMsg(`Network Error: ${error.message}`)
      setIsSubmitting(false)
    }
  }

  const CheckboxCard = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`cursor-pointer border p-3 text-sm transition-all duration-200 flex items-center gap-3 ${selected ? 'border-[#1B4D3E] bg-[#F5F0E6] text-[#1B4D3E] font-medium' : 'border-[#E5DFD3] bg-white text-[#777777] hover:border-[#C9A961]'}`}>
      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${selected ? 'bg-[#1B4D3E] border-[#1B4D3E]' : 'border-[#E5DFD3]'}`}>
        {selected && <CheckCircle size={10} className="text-white" />}
      </div>
      {label}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#F5F0E6] font-sans text-[#1A1A1A] pb-24">
      
      <nav className="bg-[#1B4D3E] px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white">
            <div className="text-xs tracking-[0.3em] uppercase opacity-90 font-light">Peace and Afrova</div>
            <div className="text-lg font-serif tracking-wider">Group Company Ltd</div>
          </Link>
          <Link href="/" className="text-xs tracking-widest uppercase text-white/70 hover:text-[#C9A961] transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Return to Website
          </Link>
        </div>
      </nav>

      <section className="pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-[#1B4D3E] mb-4">Design Your Journey</h1>
            <div className="w-16 h-px bg-[#C9A961] mx-auto mb-6" />
            <p className="text-lg text-[#777777] font-light">Tell us what you dream of. We will architect the rest.</p>
          </div>

          {activityParam && step === 1 && (
            <div className="bg-white border border-[#C9A961] p-4 mb-8 text-center animate-in fade-in">
              <p className="text-sm text-[#1B4D3E]">You are enquiring about: <strong className="font-serif text-lg text-[#C9A961]">{activityParam}</strong></p>
            </div>
          )}

          <div className="mb-10">
            <div className="flex justify-between items-center relative mb-4">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#E5DFD3] -z-10" />
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center bg-[#F5F0E6] px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                    step > num ? 'bg-[#1B4D3E] text-white' : 
                    step === num ? 'bg-[#1B4D3E] text-white ring-4 ring-[#1B4D3E]/10' : 
                    'bg-white border border-[#E5DFD3] text-[#777777]'
                  }`}>
                    {step > num ? <CheckCircle size={14} /> : `0${num}`}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-[10px] tracking-[0.2em] uppercase text-[#C9A961] font-bold">
              Step {step} of {totalSteps} · Displaying in {currency}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 mb-8 border border-red-200 text-sm text-center font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 shadow-xl border border-[#E5DFD3]">
            
            {/* STEP 1: YOUR JOURNEY */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">Where would you like to go?</h2>
                  <p className="text-sm text-[#777777] mb-4">Select all islands you wish to visit.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Mauritius', 'Seychelles', 'Reunion Island', 'Rodrigues'].map(dest => (
                      <CheckboxCard key={dest} label={dest} selected={formData.destinations.includes(dest)} onClick={() => handleArrayToggle('destinations', dest)} />
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 border-t border-[#E5DFD3] pt-8">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">What kind of journey?</label>
                    <select name="journey_type" value={formData.journey_type} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                      <option value="">Select type...</option>
                      <option value="Luxury Escape">Luxury Escape</option>
                      <option value="Ultra-Luxury">Ultra-Luxury</option>
                      <option value="Romantic Getaway">Romantic Getaway</option>
                      <option value="Family Holiday">Family Holiday</option>
                      <option value="Adventure & Discovery">Adventure & Discovery</option>
                      <option value="Wellness Retreat">Wellness Retreat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Special Occasion?</label>
                    <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                      <option value="None">None / Standard Leisure</option>
                      <option value="Honeymoon">Honeymoon</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Proposal">Proposal</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Approx. Arrival Date *</label>
                    <input required type="date" name="travel_start" value={formData.travel_start} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Duration (Nights)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 10" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-[#E5DFD3] pt-8">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Adults *</label>
                    <input required type="number" min="1" name="adults" value={formData.adults} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Children</label>
                    <input type="number" min="0" name="children" value={formData.children} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>
                {Number(formData.children) > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Children's Ages</label>
                    <input type="text" name="child_ages" value={formData.child_ages} onChange={handleChange} placeholder="e.g. 4 and 7" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: YOUR STAY */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">Where would you like to stay?</h2>
                  <p className="text-sm text-[#777777] mb-4">Tell us about your accommodation preferences.</p>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-3 font-bold">Do you already have a hotel booked? *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setFormData({...formData, has_hotel: 'yes'})} className={`cursor-pointer border p-4 text-center ${formData.has_hotel === 'yes' ? 'border-[#1B4D3E] bg-[#F5F0E6]' : 'border-[#E5DFD3]'}`}>
                      <span className="font-bold text-sm">Yes, I have a booking</span>
                    </div>
                    <div onClick={() => setFormData({...formData, has_hotel: 'no'})} className={`cursor-pointer border p-4 text-center ${formData.has_hotel === 'no' ? 'border-[#1B4D3E] bg-[#F5F0E6]' : 'border-[#E5DFD3]'}`}>
                      <span className="font-bold text-sm">No, please recommend</span>
                    </div>
                  </div>
                </div>

                {formData.has_hotel === 'yes' ? (
                  <div className="animate-in fade-in">
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Hotel Name & Location</label>
                    <input type="text" name="hotel_details" value={formData.hotel_details} onChange={handleChange} placeholder="e.g. Four Seasons, Anahita" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Style of Accommodation</label>
                      <select name="accommodation_type" value={formData.accommodation_type} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                        <option value="">Select style...</option>
                        <option value="5-Star Resort">5-Star Resort</option>
                        <option value="Boutique Hotel">Boutique Hotel</option>
                        <option value="Private Villa">Private Villa</option>
                        <option value="Eco-Lodge">Eco-Lodge</option>
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Budget per Night ({currency})</label>
                        <select name="hotel_budget" value={formData.hotel_budget} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                          <option value="">Select range...</option>
                          <option value={`${formatPrice(hotelRanges[0])} - ${formatPrice(hotelRanges[1])}`}>{formatPrice(hotelRanges[0])} - {formatPrice(hotelRanges[1])}</option>
                          <option value={`${formatPrice(hotelRanges[1])} - ${formatPrice(hotelRanges[2])}`}>{formatPrice(hotelRanges[1])} - {formatPrice(hotelRanges[2])}</option>
                          <option value={`${formatPrice(hotelRanges[2])} - ${formatPrice(hotelRanges[3])}`}>{formatPrice(hotelRanges[2])} - {formatPrice(hotelRanges[3])}</option>
                          <option value={`${formatPrice(hotelRanges[3])}+`}>{formatPrice(hotelRanges[3])}+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Preferred Coast</label>
                        <select name="hotel_location" value={formData.hotel_location} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                          <option value="">Any location</option>
                          <option value="North">North Coast</option>
                          <option value="West">West Coast</option>
                          <option value="East">East Coast</option>
                          <option value="South">South Coast</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: EXPERIENCES */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">What would make this journey special?</h2>
                  <p className="text-sm text-[#777777] mb-6">Select the experiences you would love to include.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Ocean & Sailing', 'Nature & Adventure', 'Gastronomy', 'Culture & Heritage', 'Wellness & Spa', 'Private Experiences', 'Helicopter Tours', 'Golf', 'Celebrations'].map(exp => (
                    <CheckboxCard key={exp} label={exp} selected={formData.experiences.includes(exp)} onClick={() => handleArrayToggle('experiences', exp)} />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: ARRANGEMENTS */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">The practical details.</h2>
                  <p className="text-sm text-[#777777] mb-6">Let us know how we can smooth your arrival.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needs_transfers" checked={formData.needs_transfers} onChange={handleChange} className="w-5 h-5 accent-[#1B4D3E]" />
                    <span className="text-sm font-medium text-[#1B4D3E]">I require Airport Transfers</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needs_chauffeur" checked={formData.needs_chauffeur} onChange={handleChange} className="w-5 h-5 accent-[#1B4D3E]" />
                    <span className="text-sm font-medium text-[#1B4D3E]">I require a Private Chauffeur during my stay</span>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-[#E5DFD3]">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Arrival Flight (Optional)</label>
                    <input type="text" name="arrival_flight" value={formData.arrival_flight} onChange={handleChange} placeholder="e.g. MK015" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Departure Flight (Optional)</label>
                    <input type="text" name="departure_flight" value={formData.departure_flight} onChange={handleChange} placeholder="e.g. MK016" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Dietary Requirements</label>
                  <input type="text" name="dietary_requirements" value={formData.dietary_requirements} onChange={handleChange} placeholder="e.g. Vegan, Nut allergy, Halal" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Mobility or Accessibility Needs</label>
                  <input type="text" name="mobility_requirements" value={formData.mobility_requirements} onChange={handleChange} placeholder="e.g. Wheelchair access required" className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
              </div>
            )}

            {/* STEP 5: GET ACQUAINTED */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">Let's get acquainted.</h2>
                  <p className="text-sm text-[#777777] mb-6">How can we prepare your proposal?</p>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Approximate Total Budget ({currency})</label>
                  <select name="total_budget" value={formData.total_budget} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="">Select budget range...</option>
                    <option value={`${formatPrice(totalRanges[0])} - ${formatPrice(totalRanges[1])}`}>{formatPrice(totalRanges[0])} - {formatPrice(totalRanges[1])}</option>
                    <option value={`${formatPrice(totalRanges[1])} - ${formatPrice(totalRanges[2])}`}>{formatPrice(totalRanges[1])} - {formatPrice(totalRanges[2])}</option>
                    <option value={`${formatPrice(totalRanges[2])} - ${formatPrice(totalRanges[3])}`}>{formatPrice(totalRanges[2])} - {formatPrice(totalRanges[3])}</option>
                    <option value={`${formatPrice(totalRanges[3])}+`}>{formatPrice(totalRanges[3])}+</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-[#E5DFD3]">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">WhatsApp / Phone *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+230 ..." className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Country of Residence</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#1B4D3E] mb-2 font-bold">Preferred Contact Method</label>
                  <select name="contact_method" value={formData.contact_method} onChange={handleChange} className="w-full border-b border-[#E5DFD3] bg-transparent py-2 text-sm focus:outline-none focus:border-[#C9A961]">
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Telephone Call">Telephone Call</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#E5DFD3]">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input required type="checkbox" name="privacy_consent" checked={formData.privacy_consent} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#1B4D3E]" />
                    <span className="text-xs text-[#777777] leading-relaxed group-hover:text-[#1A1A1A] transition-colors">
                      I consent to Peace & Afrova processing my personal information to design and propose my travel itinerary, in accordance with the <Link href="/policies/privacy" className="text-[#1B4D3E] underline">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-[#E5DFD3] flex justify-between items-center">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="text-xs tracking-widest uppercase text-[#777777] hover:text-[#1B4D3E] transition font-bold flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}

              {step < totalSteps ? (
                <button type="button" onClick={nextStep} className="bg-[#1B4D3E] text-white px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition flex items-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="bg-[#C9A961] text-[#1B4D3E] px-10 py-3 text-xs tracking-widest uppercase font-bold hover:bg-[#1B4D3E] hover:text-white transition disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              )}
            </div>

          </form>
        </div>
      </section>
    </main>
  )
}

export default function BespokePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F0E6] text-[#1B4D3E]">Loading...</div>}>
      <BespokeForm />
    </Suspense>
  )
}