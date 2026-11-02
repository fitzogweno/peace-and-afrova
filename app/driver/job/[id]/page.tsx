"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { CheckCircle, Clock, MapPin, User, Plane, AlertTriangle, Car } from 'lucide-react'

export default function MagicLinkJobPage() {
  const params = useParams()
  const jobId = params.id as string
  
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      const { data } = await supabase
        .from('supplier_bookings')
        .select(`
          id, service_description, pickup_time, driver_name, vehicle_plate, confirmation_number, job_status,
          quotations (
            bookings ( travel_start, customer_name, car_seats, dietary_needs ),
            enquiries ( arrival_flight, departure_flight, hotel_details )
          )
        `)
        .eq('id', jobId)
        .single()
      
      if (data) setJob(data)
      setLoading(false)
    }
    if (jobId) fetchJob()
  }, [jobId])

  async function updateStatus(newStatus: string) {
    setIsUpdating(true)
    const updateData: any = { job_status: newStatus }
    if (newStatus === 'Picked Up') {
      updateData.picked_up_at = new Date().toISOString()
    }

    await supabase.from('supplier_bookings').update(updateData).eq('id', jobId)
    setJob({ ...job, job_status: newStatus })
    setIsUpdating(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F0E6] text-[#1B4D3E] font-serif text-2xl">Loading Job...</div>
  if (!job) return <div className="min-h-screen flex items-center justify-center bg-[#F5F0E6] text-red-600 font-serif text-2xl">Job not found.</div>

  const quotation = Array.isArray(job.quotations) ? job.quotations[0] : job.quotations
  const booking = Array.isArray(quotation?.bookings) ? quotation.bookings[0] : quotation?.bookings
  const enquiry = Array.isArray(quotation?.enquiries) ? quotation.enquiries[0] : quotation?.enquiries

  return (
    <div className="min-h-screen bg-[#F5F0E6] p-6 font-sans text-[#1A1A1A] flex items-center justify-center">
      <div className="bg-white max-w-md w-full shadow-2xl border border-[#E5DFD3] overflow-hidden">
        
        <div className="bg-[#1B4D3E] p-6 text-white text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Peace and Afrova</div>
          <h1 className="font-serif text-2xl">Driver Dispatch</h1>
          <div className="mt-2 text-sm opacity-80">Ref: {job.confirmation_number}</div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#FAF7F0] p-4 border border-[#E5DFD3] rounded-sm">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Client</div>
            <div className="font-serif text-xl text-[#1B4D3E] mb-3">{booking?.customer_name}</div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#C9A961] mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-500 uppercase">Hotel / Pickup</span>
                  <strong>{enquiry?.hotel_details || 'TBC'}</strong>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-[#C9A961] mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-500 uppercase">Pickup Time</span>
                  <strong>{job.pickup_time || 'TBC'}</strong> | Date: {booking?.travel_start}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Plane size={16} className="text-[#C9A961] mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-500 uppercase">Flight</span>
                  <strong>Arr: {enquiry?.arrival_flight || 'N/A'} {enquiry?.departure_flight ? `| Dep: ${enquiry.departure_flight}` : ''}</strong>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Car size={16} className="text-[#C9A961] mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-500 uppercase">Service</span>
                  <strong>{job.service_description}</strong>
                </div>
              </div>
            </div>

            {(booking?.car_seats || booking?.dietary_needs) && (
              <div className="mt-4 pt-3 border-t border-[#E5DFD3] space-y-2">
                {booking.car_seats && <div className="flex items-center gap-2 text-xs font-bold text-orange-700 bg-orange-100 p-2 rounded"><AlertTriangle size={14}/> CAR SEAT: {booking.car_seats}</div>}
                {booking.dietary_needs && <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100 p-2 rounded"><AlertTriangle size={14}/> DIETARY: {booking.dietary_needs}</div>}
              </div>
            )}
          </div>

          <div className="pt-4 space-y-3">
            {job.job_status === 'Pending' || !job.job_status ? (
              <button onClick={() => updateStatus('Accepted')} disabled={isUpdating} className="w-full bg-[#1B4D3E] text-white py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 flex justify-center items-center gap-2">
                <CheckCircle size={18} /> Accept This Job
              </button>
            ) : job.job_status === 'Accepted' ? (
              <button onClick={() => updateStatus('Picked Up')} disabled={isUpdating} className="w-full bg-[#C9A961] text-[#1B4D3E] py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#1B4D3E] hover:text-white transition disabled:opacity-50 flex justify-center items-center gap-2">
                <User size={18} /> Mark as Picked Up
              </button>
            ) : (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded text-green-800">
                <CheckCircle className="mx-auto mb-2" size={24} />
                <p className="font-bold text-sm uppercase tracking-wider">Job Completed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}