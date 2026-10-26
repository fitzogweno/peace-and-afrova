"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MapPin, User, CheckCircle, Navigation } from 'lucide-react'

function DriverDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<any[]>([])
  const [driverName, setDriverName] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const urlName = searchParams.get('driver')
    const cookieName = document.cookie.split('; ').find(row => row.startsWith('driver_session='))?.split('=')[1]
    const name = urlName || cookieName || ''

    if (!name) {
      router.push('/driver')
      return
    }
    
    document.cookie = `driver_session=${name}; path=/`
    setDriverName(name)

    async function fetchJobs() {
      // Simplied, bulletproof query
      const { data, error } = await supabase
        .from('supplier_bookings')
        .select(`
          *,
          quotations (
            bookings (
              travel_start,
              customer_name
            ),
            enquiries (
              arrival_flight,
              hotel_details
            )
          )
        `)
        .eq('driver_name', name)
        .neq('job_status', 'Completed')

      if (error) {
        console.error("Error fetching driver jobs:", error)
      } else if (data) {
        setJobs(data)
      }
      setLoading(false)
    }
    fetchJobs()
  }, [router, searchParams])

  async function updateStatus(jobId: string, newStatus: string) {
    const { error } = await supabase
      .from('supplier_bookings')
      .update({ job_status: newStatus })
      .eq('id', jobId)

    if (!error) {
      setJobs(jobs.map(job => job.id === jobId ? { ...job, job_status: newStatus } : job))
    } else {
      alert("Failed to update status. Check internet connection.")
    }
  }

  function handleLogout() {
    document.cookie = "driver_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/driver')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] p-4 pb-24 font-sans text-[#1A1A1A]">
      
      <header className="flex justify-between items-center mb-6 bg-[#1B4D3E] text-white p-4 shadow-md">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#C9A961]">Driver</div>
          <div className="font-serif text-xl">{driverName}</div>
        </div>
        <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-white/70 hover:text-white">
          Sign Out
        </button>
      </header>

      <h1 className="font-serif text-2xl text-[#1B4D3E] mb-4">My Assignments</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-8 text-center border border-[#E5DFD3] shadow-sm">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="font-serif text-xl text-[#1B4D3E] mb-2">All Clear!</h2>
          <p className="text-sm text-gray-500">You have no pending jobs assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            // Safely extract data based on the new simplified query
            const booking = job.quotations?.bookings?.[0]
            const enquiry = job.quotations?.enquiries?.[0]
            const flight = enquiry?.arrival_flight
            const hotel = enquiry?.hotel_details || 'Hotel TBC'

            return (
              <div key={job.id} className="bg-white border-l-4 border-[#C9A961] shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#3D8B8B]">{job.service_description}</div>
                  <div className="text-xs font-medium text-gray-500">{booking?.travel_start || 'Date TBC'}</div>
                </div>
                
                <div className="font-serif text-lg text-[#1B4D3E] mb-3">{booking?.customer_name || 'Client Name TBC'}</div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4 bg-[#FAF7F0] p-3 border border-[#E5DFD3]">
                  <p className="flex items-center gap-2"><User size={14} className="text-[#C9A961]"/> Provider: {job.supplier_name}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-[#C9A961]"/> Location: {hotel}</p>
                  {flight && <p className="flex items-center gap-2 font-medium text-[#1B4D3E]"><Navigation size={14} className="text-[#C9A961]"/> Flight: {flight}</p>}
                </div>

                <div className="flex gap-2">
                  {job.job_status === 'Pending' || !job.job_status ? (
                    <button onClick={() => updateStatus(job.id, 'En Route')} className="flex-1 bg-[#C9A961] text-[#1B4D3E] py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#b09552] transition">
                      Start Job (En Route)
                    </button>
                  ) : job.job_status === 'En Route' ? (
                    <button onClick={() => updateStatus(job.id, 'Picked Up')} className="flex-1 bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#2A6B58] transition">
                      Guest Picked Up
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(job.id, 'Completed')} className="flex-1 bg-green-600 text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition">
                      Complete Job
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DriverDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DriverDashboardContent />
    </Suspense>
  )
}