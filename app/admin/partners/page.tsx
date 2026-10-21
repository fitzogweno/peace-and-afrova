"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Building2, Mail, Phone, Calendar } from 'lucide-react'

export default function AdminPartners() {
  const router = useRouter()
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchPartners() {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) setPartners(data)
      setLoading(false)
    }
    fetchPartners()
  }, [router])

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
          <Link href="/admin/partners" className="block text-[#C9A961]">B2B Partners</Link>
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
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">B2B Partnership Requests</h1>
        
        {loading ? (
          <p>Loading applications...</p>
        ) : partners.length === 0 ? (
          <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
            <p>No partnership requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white p-6 shadow-sm border border-[#E5DFD3] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="text-[#C9A961]" size={20} />
                    <h3 className="font-serif text-2xl text-[#1B4D3E]">{partner.company_name}</h3>
                    <span className="bg-[#FAF7F0] text-[#3D8B8B] border border-[#E5DFD3] text-xs px-2 py-1 uppercase tracking-wider">{partner.partner_type}</span>
                  </div>
                  <p className="text-sm font-medium mb-4">Contact: {partner.contact_name}</p>
                  <p className="text-sm text-gray-600 italic mb-4">"{partner.message}"</p>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><Mail size={14}/> {partner.email}</span>
                    {/* THE FIX IS HERE: Country code is now displayed */}
                    {partner.phone && <span className="flex items-center gap-2"><Phone size={14}/> {partner.country_code || ''} {partner.phone}</span>}
                    <span className="flex items-center gap-2"><Calendar size={14}/> {new Date(partner.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <a href={`mailto:${partner.email}`} className="flex-1 md:flex-none text-center bg-[#1B4D3E] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
                    Reply via Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}