"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../utils/supabase'
import { adminFetch } from '../../lib/admin-fetch'
import { LayoutDashboard, Calendar, Map, Navigation, Wallet, Handshake, CheckCircle, Settings, Users, LogOut } from 'lucide-react'

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const isLogin = pathname === '/admin/login'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isLogin) { setReady(true); return }
    let active = true
    async function verify() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin/login'); return }
      // Client accounts are Supabase users too, so confirm this account is on the admin allow-list.
      const res = await adminFetch('/api/admin/session')
      if (!active) return
      if (!res.ok) { await supabase.auth.signOut(); router.replace('/admin/login'); return }
      setReady(true)
    }
    verify()
    return () => { active = false }
  }, [isLogin, router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // The single source of truth for your sidebar links
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Service Requests', href: '/admin/requests', icon: <Map size={18} /> },
    { name: 'Operations & Bookings', href: '/admin/bookings', icon: <Calendar size={18} /> },
    { name: 'Dispatch Board', href: '/admin/dispatch', icon: <Navigation size={18} /> },
    { name: 'Supplier Scorecard', href: '/admin/suppliers', icon: <Users size={18} /> },
    { name: 'Finance', href: '/admin/finance', icon: <Wallet size={18} /> },
    { name: 'Manage Reviews', href: '/admin/reviews', icon: <CheckCircle size={18} /> },
    { name: 'Rate Catalog', href: '/admin/rates', icon: <Settings size={18} /> },
    { name: 'Partner Network', href: '/admin/partners', icon: <Handshake size={18} /> },
  ]

  if (isLogin) return <>{children}</>
  if (!ready) {
    return <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-[#1B4D3E] font-serif text-2xl">Checking access...</div>
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex font-sans text-[#1A1A1A]">
      
      {/* SIDEBAR - Rendered ONCE for all admin pages */}
      <aside className="w-full md:w-64 bg-[#1B4D3E] text-white p-6 flex flex-col print:hidden md:fixed md:h-screen">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[#C9A961] mb-1">Admin</div>
          <div className="font-serif text-xl">Peace and Afrova</div>
        </div>
        
        <nav className="space-y-4 flex-1 text-sm font-light tracking-wide overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 transition ${isActive ? 'text-[#C9A961] font-medium' : 'opacity-70 hover:opacity-100'}`}
              >
                {item.icon} {item.name}
              </Link>
            )
          })}
        </nav>
        
        <button onClick={handleSignOut} className="mt-8 flex items-center gap-2 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          <LogOut size={14} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

// usePathname() is runtime data, so on dynamic routes (e.g. /admin/quote/[id]) it must sit inside Suspense
// or Cache Components blocks the prerender.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-[#1B4D3E] font-serif text-2xl">Loading...</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  )
}
