"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Building2, Mail, Phone, Globe, Map, CheckCircle, XCircle, Users } from 'lucide-react'

export default function AdminPartners() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [applications, setApplications] = useState<any[]>([])
  const [activePartners, setActivePartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      
      // 1. Fetch Applications
      const { data: appData, error: appError } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (!appError && appData) setApplications(appData)

      // 2. Fetch Active Partners (Using our API)
      try {
        const res = await fetch('/api/partners')
        if (res.ok) {
          const json = await res.json()
          setActivePartners(json.partners || [])
        }
      } catch (err) {
        console.error("Failed to fetch active partners", err)
      }
      
      setLoading(false)
    }
    checkAuthAndFetch()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    if (!confirm(`Are you sure you want to ${action} this application?`)) return
    setProcessingId(id)
    
    try {
      const res = await fetch('/api/partner/approve', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id, action })
      })
      
      if (res.ok) {
        alert(`Application ${action}d successfully.`)
        window.location.reload()
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (err) {
      alert("Error processing application.")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingApps = applications.filter(a => a.status === 'pending_review')

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/admin" className={`block transition ${pathname === '/admin' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Dashboard</Link>
          <Link href="/admin/bookings" className={`block transition ${pathname === '/admin/bookings' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Operations & Bookings</Link>
          <Link href="/admin/dispatch" className={`block transition ${pathname === '/admin/dispatch' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Dispatch Board</Link>
          <Link href="/admin/suppliers" className={`block transition ${pathname === '/admin/suppliers' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Supplier Scorecard</Link>
          <Link href="/admin/finance" className={`block transition ${pathname === '/admin/finance' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Finance</Link>
          <Link href="/admin/reviews" className={`block transition ${pathname === '/admin/reviews' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Manage Reviews</Link>
          <Link href="/admin/rates" className={`block transition ${pathname === '/admin/rates' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Rate Catalog</Link>
          <Link href="/admin/partners" className={`block transition ${pathname === '/admin/partners' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>Partner Network</Link>
        </nav>
        <button onClick={handleSignOut} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">Sign Out</button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-auto space-y-12">
        
        {/* PENDING APPLICATIONS SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h1 className="font-serif text-4xl text-[#1B4D3E]">Pending Applications</h1>
            <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">{pendingApps.length}</span>
          </div>
          
          {loading ? (
            <p>Loading applications...</p>
          ) : pendingApps.length === 0 ? (
            <div className="bg-white p-8 text-center text-[#4A4A4A] shadow-sm border border-[#E5DFD3]">
              <p>No pending applications requiring review.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingApps.map((app) => (
                <div key={app.id} className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5DFD3] pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Building2 className="text-[#C9A961]" size={20} />
                        <h3 className="font-serif text-2xl text-[#1B4D3E]">{app.company_name}</h3>
                        <span className="bg-[#FAF7F0] text-[#3D8B8B] border border-[#E5DFD3] text-xs px-2 py-1 uppercase tracking-wider">{app.partner_type}</span>
                      </div>
                      <div className="text-sm text-gray-500 font-mono mt-1">Ref: {app.application_reference}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(app.id, 'approve')} 
                        disabled={processingId === app.id}
                        className="bg-green-600 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(app.id, 'reject')} 
                        disabled={processingId === app.id}
                        className="bg-red-600 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-3">
                      <h4 className="font-bold text-[#1B4D3E] uppercase tracking-widest text-[10px] mb-2">Contact Information</h4>
                      <p className="flex items-center gap-2"><Mail size={14} className="text-[#C9A961]"/> {app.email}</p>
                      <p className="flex items-center gap-2"><Phone size={14} className="text-[#C9A961]"/> {app.country_code} {app.phone}</p>
                      <p className="flex items-center gap-2"><Globe size={14} className="text-[#C9A961]"/> {app.website || 'No website provided'}</p>
                      <p className="flex items-center gap-2"><Map size={14} className="text-[#C9A961]"/> {app.country}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-[#1B4D3E] uppercase tracking-widest text-[10px] mb-2">Business Profile</h4>
                      <div className="flex flex-wrap gap-1">
                        {app.destinations?.map((d: string) => <span key={d} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{d}</span>)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.services?.map((s: string) => <span key={s} className="bg-[#FAF7F0] text-[#3D8B8B] border border-[#E5DFD3] px-2 py-0.5 rounded text-xs">{s}</span>)}
                      </div>
                      <p className="text-gray-600 italic mt-2 text-xs">"{app.introduction}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ACTIVE PARTNERS DIRECTORY */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-t border-[#E5DFD3] pt-12">
            <Users className="text-[#C9A961]" size={28} />
            <h2 className="font-serif text-3xl text-[#1B4D3E]">Active Partner Directory</h2>
          </div>

          <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#4A4A4A] font-light">
                {activePartners.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No active partners yet. Approve an application to add them here.</td></tr>
                ) : (
                  activePartners.map((partner) => (
                    <tr key={partner.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                      <td className="p-4 font-medium text-[#1B4D3E]">{partner.company_name}</td>
                      <td className="p-4">
                        <span className="bg-[#FAF7F0] text-[#3D8B8B] border border-[#E5DFD3] text-xs px-2 py-1 uppercase tracking-wider">
                          {partner.partner_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>{partner.email}</div>
                        <div className="text-xs text-gray-400">{partner.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  )
}