"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, TrendingUp, AlertCircle, PieChart as PieIcon, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

  if (loading) return <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">Loading cockpit...</div>

  const pieData = [
    { name: 'Cash Collected', value: data?.cashCollected || 0 },
    { name: 'Balances Due', value: data?.balancesDue || 0 },
  ]
  const COLORS = ['#1B4D3E', '#C9A961']

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
          <Link href="/admin/reviews" className="block opacity-70 hover:opacity-100 transition">Manage Reviews</Link>
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
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Financial Cockpit</h1>
        
        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="text-[#1B4D3E]" size={24} />
                <h2 className="text-sm tracking-widest uppercase text-gray-500 font-medium">Cash Collected</h2>
              </div>
              <p className="text-3xl font-serif text-[#1B4D3E]">Rs {data?.cashCollected.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-[#C9A961]" size={24} />
                <h2 className="text-sm tracking-widest uppercase text-gray-500 font-medium">Balances Due</h2>
              </div>
              <p className="text-3xl font-serif text-[#C9A961]">Rs {data?.balancesDue.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="bg-[#1B4D3E] p-8 shadow-sm flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-[#C9A961]" size={24} />
                <h2 className="text-sm tracking-widest uppercase text-white/70 font-medium">Total Est. Profit</h2>
              </div>
              <p className="text-3xl font-serif text-white">Rs {data?.totalGrossProfit.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BAR CHART: REVENUE VS PROFIT */}
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3]">
            <div className="flex items-center gap-2 mb-6 text-[#1B4D3E]">
              <BarChart3 size={20} />
              <h2 className="font-serif text-xl">Monthly Revenue vs Profit</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4A4A4A', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4A4A4A', fontSize: 12 }} tickFormatter={(value: number) => `Rs ${value / 1000}k`} />
                  <Tooltip cursor={{ fill: '#F5F0E6' }} contentStyle={{ borderRadius: '0', border: '1px solid #E5DFD3' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3D8B8B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#C9A961" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART: CASH VS DUE */}
          <div className="bg-white p-8 shadow-sm border border-[#E5DFD3]">
            <div className="flex items-center gap-2 mb-6 text-[#1B4D3E]">
              <PieIcon size={20} />
              <h2 className="font-serif text-xl">Cash Flow Breakdown</h2>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `Rs ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-[#1B4D3E] rounded-full"></div> Collected
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-[#C9A961] rounded-full"></div> Outstanding
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}