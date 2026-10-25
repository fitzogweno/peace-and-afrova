"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { CheckCircle, XCircle, Star } from 'lucide-react'

export default function AdminReviews() {
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setReviews(data)
      setLoading(false)
    }
    fetchReviews()
  }, [router])

  async function toggleApproval(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: !currentStatus })
      .eq('id', id)
    
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r))
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className="block opacity-70 hover:opacity-100 transition">Dashboard</Link>
          <Link href="/admin/bookings" className="block opacity-70 hover:opacity-100 transition">Operations & Bookings</Link>
          <Link href="/admin/finance" className="block opacity-70 hover:opacity-100 transition">Finance</Link>
          <Link href="/admin/reviews" className="block text-[#C9A961]">Manage Reviews</Link>
          <Link href="/admin/rates" className="block opacity-70 hover:opacity-100 transition">Rate Catalog</Link>
        </nav>
        <button onClick={() => {
          document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push('/admin/login')
        }} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Manage Client Reviews</h1>
        
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
            <p>No reviews submitted yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div key={review.id} className={`bg-white p-6 shadow-sm border ${review.is_approved ? 'border-green-200' : 'border-orange-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#1B4D3E]">{review.client_name}</span>
                      <span className="text-xs text-gray-400">({review.email})</span>
                    </div>
                    <div className="flex gap-1 text-[#C9A961]">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleApproval(review.id, review.is_approved)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition ${
                      review.is_approved 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                        : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {review.is_approved ? <><XCircle size={14}/> Reject</> : <><CheckCircle size={14}/> Approve</>}
                  </button>
                </div>
                <p className="text-gray-600 italic">"{review.review_text}"</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}