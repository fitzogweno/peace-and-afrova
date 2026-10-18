"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchEnquiries() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: joinedData, error: joinedError } = await supabase
        .from('enquiries')
        .select(`
          *,
          customers (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (joinedError) {
        console.error("Join query failed, trying basic query. Error:", joinedError)
        const { data: basicData, error: basicError } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })

        if (basicError) {
          console.error("Basic query also failed:", basicError)
        } else {
          setEnquiries(basicData || [])
        }
      } else {
        setEnquiries(joinedData || [])
      }
      
      setLoading(false)
    }

    fetchEnquiries()
  }, [router])

  function handleLogout() {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className="block text-[#C9A961]">Dashboard</Link>
          <Link href="/admin/rates" className="block opacity-70 hover:opacity-100 transition">Rate Catalog</Link>
          <Link href="/experiences" className="block opacity-70 hover:opacity-100 transition">View Public Site</Link>
        </nav>
        <button onClick={handleLogout} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Recent Enquiries</h1>

        {loading ? (
          <p className="text-[#4A4A4A]">Loading database...</p>
        ) : enquiries.length === 0 ? (
          <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
            <p className="mb-4">No enquiries found in the database.</p>
            <Link href="/bespoke" target="_blank" className="text-[#1B4D3E] font-medium underline">
              Open the Enquiry Form to submit a test
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm overflow-x-auto border border-[#E5DFD3]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B] bg-[#FAF7F0]">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Travel Date</th>
                  <th className="p-4 font-medium">Pax</th>
                  <th className="p-4 font-medium">Interests</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#4A4A4A] font-light">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                    <td className="p-4 whitespace-nowrap">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#1B4D3E]">
                        {enq.customers?.full_name || 'Unknown Client'}
                      </div>
                      <div className="text-xs">{enq.customers?.email || ''}</div>
                      <div className="text-xs">{enq.customers?.phone || ''}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{enq.travel_start}</td>
                    <td className="p-4">{enq.party_size}</td>
                    <td className="p-4 max-w-xs truncate" title={enq.interests}>
                      {enq.interests}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/quote/${enq.id}`} 
                        className="inline-block bg-[#1B4D3E] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition whitespace-nowrap"
                      >
                        Create Quote
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}