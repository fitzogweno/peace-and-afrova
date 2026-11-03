"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { LayoutDashboard, Calendar, FileText, Send, Settings, LogOut, Building2, Bell } from 'lucide-react'

export default function PartnerDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initPage() {
      // 1. Secure Auth Check
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/partner/login')
        return
      }

      // 2. Fetch Partner Company Record
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (data) {
        setPartner(data)
      } else {
        // If they are logged in but not in the partners table, something is wrong
        console.error("Partner record not found for this email.")
      }
      setLoading(false)
    }
    initPage()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/partner/login')
  }

  if (loading) return <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-[#1B4D3E]">Loading Partner Portal...</div>

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Partner Portal</div>
          <div className="font-serif text-xl">{partner?.company_name || 'Loading...'}</div>
          <div className="text-xs text-white/50 mt-1 capitalize">{partner?.partner_type}</div>
        </div>
        
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide">
          <Link href="/partner/dashboard" className={`flex items-center gap-3 transition ${pathname === '/partner/dashboard' ? 'text-[#C9A961]' : 'opacity-70 hover:opacity-100'}`}>
            <LayoutDashboard size={16} /> Overview
          </Link>
          <Link href="/partner/dashboard/requests" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <Bell size={16} /> Service Requests
          </Link>
          <Link href="/partner/dashboard/bookings" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <Calendar size={16} /> My Bookings
          </Link>
          <Link href="/partner/dashboard/quotations" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <FileText size={16} /> Quotations
          </Link>
          <Link href="/partner/dashboard/invoices" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <Send size={16} /> Invoices
          </Link>
          <Link href="/partner/dashboard/profile" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <Building2 size={16} /> Company Profile
          </Link>
          <Link href="/partner/dashboard/settings" className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
            <Settings size={16} /> Settings
          </Link>
        </nav>
        
        <button onClick={handleSignOut} className="mt-8 flex items-center gap-2 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          <LogOut size={14} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Welcome, {partner?.contact_name?.split(' ')[0]}</h1>
        
        {/* PLACEHOLDER WIDGETS (To be built next) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-medium">New Requests</div>
            <div className="text-3xl font-serif text-[#1B4D3E]">0</div>
            <div className="text-xs text-gray-400 mt-2">Awaiting your response</div>
          </div>
          <div className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-medium">Upcoming Bookings</div>
            <div className="text-3xl font-serif text-[#1B4D3E]">0</div>
            <div className="text-xs text-gray-400 mt-2">Services to be delivered</div>
          </div>
          <div className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
            <div className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-medium">Outstanding Invoices</div>
            <div className="text-3xl font-serif text-[#C9A961]">0</div>
            <div className="text-xs text-gray-400 mt-2">Awaiting settlement</div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-[#E5DFD3] p-8 text-center">
          <Building2 className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">Your Workspace is Ready</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This is your secure portal. Soon, you will be able to receive service requests, submit quotations, and manage your operations directly from here.
          </p>
        </div>
      </main>
    </div>
  )
}