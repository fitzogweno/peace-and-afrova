"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Briefcase, MapPin, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Initialize Supabase directly here to avoid path issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase.from('jobs').select('*').eq('is_active', true)
      if (data) setJobs(data)
    }
    fetchJobs()
  }, [])

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await fetch('/api/apply', {
      method: 'POST',
      body: JSON.stringify({
        job_id: selectedJob.id,
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        cover_letter: formData.get('cover_letter')
      })
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      alert("Failed to submit application.")
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
          <div className="hidden md:flex items-center gap-12 text-white text-xs tracking-[0.2em] uppercase font-light">
            <Link href="/experiences" className="hover:text-[#C9A961] transition-colors">Experiences</Link>
            <Link href="/about" className="hover:text-[#C9A961] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#C9A961] transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1B4D3E] mb-6 font-light">Join Our Team</h1>
          <div className="w-16 h-px bg-[#C9A961] mx-auto mb-8" />
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light">
            We are always looking for passionate individuals to help us craft exceptional Mauritian experiences.
          </p>
        </div>
      </section>

      <section className="px-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 md:p-8 shadow-sm border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">{job.title}</h3>
                <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-gray-500">
                  <span className="flex items-center gap-1"><Briefcase size={14}/> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedJob(job); setSuccess(false); }} className="bg-[#1B4D3E] text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap">
                View & Apply
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F0E6] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-2">{selectedJob.title}</h2>
            <p className="text-sm text-gray-600 mb-8">{selectedJob.description}</p>

            {success ? (
              <div className="bg-green-50 border border-green-200 p-8 text-center">
                <h3 className="font-serif text-2xl text-green-800 mb-2">Application Received</h3>
                <p className="text-sm text-green-700">Thank you. Our team will review your application and contact you if there is a fit.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Full Name</label>
                  <input required name="full_name" type="text" className="w-full border border-[#E5DFD3] bg-white p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Email</label>
                    <input required name="email" type="email" className="w-full border border-[#E5DFD3] bg-white p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Phone</label>
                    <input required name="phone" type="tel" className="w-full border border-[#E5DFD3] bg-white p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Cover Letter</label>
                  <textarea required name="cover_letter" rows={4} className="w-full border border-[#E5DFD3] bg-white p-3 text-sm focus:outline-none focus:border-[#C9A961]"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}