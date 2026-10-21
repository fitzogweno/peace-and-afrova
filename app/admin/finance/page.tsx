"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react'

export default function FinanceDashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function fetchFinanceData() {
      const res = await fetch('/api/finance')
      const json = await res.json()
      if (res.ok) setData(json)
      setLoading(false)
    }
    fetchFinanceData()
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
          <Link href="/admin/finance" className="block text-[#C9A961]">Finance</Link>
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
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Commercial Control Centre</h1>
        
        {loading ? (
          <p>Loading financial data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CASH COLLECTED */}
            <div className="bg-white p-8 shadow-sm border border-[#E5DFD3] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-[#1B4D3E]" size={24} />
                  <h2 className="text-sm tracking-widest uppercase text-gray-500 font-medium">Cash Collected</h2>
                </div>
                <p className="text-3xl font-serif text-[#1B4D3E]">
                  Rs {data?.cashCollected.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-6">Deposits confirmed in your bank account.</p>
            </div>

            {/* BALANCES DUE */}
            <div className="bg-white p-8 shadow-sm border border-[#E5DFD3] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-[#C9A961]" size={24} />
                  <h2 className="text-sm tracking-widest uppercase text-gray-500 font-medium">Balances Due</h2>
                </div>
                <p className="text-3xl font-serif text-[#C9A961]">
                  Rs {data?.balancesDue.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-6">Outstanding balances to collect before travel.</p>
            </div>

            {/* GROSS PROFIT */}
            <div className="bg-[#1B4D3E] p-8 shadow-sm flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-[#C9A961]" size={24} />
                  <h2 className="text-sm tracking-widest uppercase text-white/70 font-medium">Total Est. Profit</h2>
                </div>
                <p className="text-3xl font-serif text-white">
                  Rs {data?.totalGrossProfit.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-white/50 mt-6">Revenue minus supplier costs across all bookings.</p>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}