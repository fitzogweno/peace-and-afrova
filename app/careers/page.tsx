"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin, X, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Proper TypeScript Interface
type Job = {
  id: string
  title: string
  department: string
  location: string
  description: string
  is_active: boolean
}

export default function CareersPage() {
  // 1. Memoized Supabase Client (fixes the re-render issue)
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  
  // 2. Proper State Management
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [applicationError, setApplicationError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  useEffect(() => {
    let active = true

    async function fetchJobs() {
      setLoading(true)
      setLoadError("")

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, department, location, description, is_active")
          .eq("is_active", true)

        if (error) throw error
        if (active) setJobs(data ?? [])
      } catch (error) {
        console.error("Careers loading error:", error)
        if (active) setLoadError("We couldn't load current opportunities. Please try again later.")
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchJobs()
    return () => { active = false }
  }, [supabase])

  // 3. Updated handleApply for File Upload
  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedJob || isSubmitting) return

    setIsSubmitting(true)
    setApplicationError("")

    // Safely capture the form element before async operations
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Append the file manually if it exists
    if (cvFile) {
      formData.append('cv', cvFile)
    }

    try {
      // NOTE: We remove the "Content-Type": "application/json" header 
      // so the browser automatically sets it to "multipart/form-data"
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const result = await res.json().catch(() => null)
        throw new Error(result?.error || "Unable to submit your application.")
      }

      setSuccess(true)
      form.reset()
      setCvFile(null)
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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

      {/* MANIFESTO HERO SECTION */}
      <section className="pt-24 pb-16 px-6 text-center border-b border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <h1 className="font-serif text-5xl md:text-7xl text-[#1B4D3E] mb-6 font-light tracking-tight">
            Build Something Exceptional.
          </h1>
          <p className="text-sm tracking-[0.3em] uppercase text-[#C9A961] mb-8 font-medium">
            Small team. Big ambition. Real ownership.
          </p>
          
          <p className="text-lg text-[#4A4A4A] leading-relaxed font-light mb-12 max-w-2xl mx-auto">
            We are building a new generation of destination management in Mauritius — combining exceptional hospitality, intelligent technology, and operational excellence.
          </p>

          {/* CULTURE VALUES GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            {[
              "Ownership over supervision",
              "Results over meetings",
              "Initiative over instructions",
              "Technology over manual work",
              "Quality over quantity",
              "Integrity over shortcuts"
            ].map((value, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#1B4D3E]">
                <CheckCircle2 size={16} className="text-[#C9A961] shrink-0" />
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-16 px-6 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl text-[#1B4D3E] mb-8 text-center">Open Positions</h2>
        
        {/* Empty & Loading States */}
        {loading ? (
          <div className="text-center py-12 text-[#3D8B8B] animate-pulse">
            Loading current opportunities...
          </div>
        ) : loadError ? (
          <div className="bg-red-50 text-red-600 p-6 text-center border border-red-200">
            <AlertCircle className="mx-auto mb-2" />
            {loadError}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 text-center border border-[#E5DFD3] shadow-sm">
            <Briefcase size={32} className="mx-auto text-[#C9A961] mb-4" />
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-2">No open positions right now</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              We are not actively recruiting at this moment, but we are always looking for exceptional talent. Feel free to reach out to us directly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-6 md:p-8 shadow-sm border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#C9A961] transition">
                <div>
                  <h3 className="font-serif text-2xl text-[#1B4D3E] mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-gray-500">
                    <span className="flex items-center gap-1"><Briefcase size={14}/> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedJob(job); setSuccess(false); setApplicationError(""); setCvFile(null); }} className="bg-[#1B4D3E] text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap">
                  View & Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* APPLICATION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            
            <h2 className="font-serif text-3xl text-[#1B4D3E] mb-2">{selectedJob.title}</h2>
            <p className="text-sm text-gray-600 mb-8 whitespace-pre-wrap">{selectedJob.description}</p>

            {success ? (
              <div className="bg-green-50 border border-green-200 p-8 text-center rounded-sm">
                <CheckCircle2 className="mx-auto text-green-600 mb-3" size={32} />
                <h3 className="font-serif text-2xl text-green-800 mb-2">Application Received</h3>
                <p className="text-sm text-green-700">Thank you. We will review your application and contact you if there is a fit.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {applicationError && (
                  <div className="bg-red-50 text-red-600 p-3 text-sm border border-red-200 flex items-center gap-2">
                    <AlertCircle size={16} /> {applicationError}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Full Name</label>
                  <input required name="full_name" type="text" className="w-full border border-[#E5DFD3] bg-white p-3 text-sm focus:outline-none focus:border-[#C9A961]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* CV UPLOAD UI */}
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">CV / Resume (PDF)</label>
                  <div className="border border-dashed border-[#C9A961] bg-white p-4 flex items-center justify-center relative hover:bg-[#FAF7F0] transition cursor-pointer">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <UploadCloud className="mx-auto text-[#C9A961] mb-1" size={20} />
                      <span className="text-xs text-gray-500">
                        {cvFile ? cvFile.name : "Click to upload your CV"}
                      </span>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D3E] text-white py-4 text-sm tracking-widest uppercase hover:bg-[#2A6B58] transition disabled:opacity-50 mt-4">
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