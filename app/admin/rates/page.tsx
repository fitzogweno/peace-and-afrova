"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function RateManager() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [category, setCategory] = useState('Transport')
  const [name, setName] = useState('')
  const [netCost, setNetCost] = useState('')
  const [sellPrice, setSellPrice] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').order('category')
    if (data) setServices(data)
    setLoading(false)
  }

  useEffect(() => {
    const isLoggedIn = document.cookie.includes('admin_session=true')
    if (!isLoggedIn) {
      window.location.href = '/admin/login'
      return
    }
    fetchServices()
  }, [])

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault()
    
    const { error } = await supabase.from('services').insert({
      category,
      name,
      net_cost: parseFloat(netCost),
      sell_price: parseFloat(sellPrice)
    })

    if (error) {
      alert("Error adding service")
      console.error(error)
    } else {
      // Reset form and refresh list
      setName('')
      setNetCost('')
      setSellPrice('')
      fetchServices()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    fetchServices()
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
          <Link href="/admin" className="block opacity-70 hover:opacity-100 transition">Dashboard</Link>
          <Link href="/admin/rates" className="block text-[#C9A961]">Rate Catalog</Link>
          <Link href="/experiences" className="block opacity-70 hover:opacity-100 transition">View Public Site</Link>
        </nav>
        <button onClick={() => {
          document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          window.location.href = '/admin/login'
        }} className="mt-8 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 hover:text-red-300 text-left transition">
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <h1 className="font-serif text-4xl text-[#1B4D3E] mb-8">Rate Catalog</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ADD NEW SERVICE FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm border border-[#E5DFD3]">
              <h2 className="font-serif text-xl text-[#1B4D3E] mb-4 border-b border-[#E5DFD3] pb-2">Add New Service</h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Tours">Tours</option>
                    <option value="SIC">SIC</option>
                    <option value="Ancillary">Ancillary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Service Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Standard Car - Full Day"
                    className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Net Cost (Rs)</label>
                    <input 
                      type="number" 
                      value={netCost}
                      onChange={(e) => setNetCost(e.target.value)}
                      required
                      className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-1 font-medium">Sell Price (Rs)</label>
                    <input 
                      type="number" 
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      required
                      className="w-full border border-[#E5DFD3] p-2 text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#1B4D3E] text-white py-2 text-xs tracking-widest uppercase hover:bg-[#2A6B58] transition mt-2 flex items-center justify-center gap-2">
                  <Plus size={16} /> Add to Catalog
                </button>
              </form>
            </div>
          </div>

          {/* EXISTING SERVICES LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                    <th className="p-4 font-medium">Service</th>
                    <th className="p-4 font-medium text-right">Net Cost</th>
                    <th className="p-4 font-medium text-right">Sell Price</th>
                    <th className="p-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#4A4A4A] font-light">
                  {loading ? (
                    <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                  ) : services.map((service) => (
                    <tr key={service.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                      <td className="p-4">
                        <div className="font-medium text-[#1B4D3E]">{service.name}</div>
                        <div className="text-xs text-[#3D8B8B]">{service.category}</div>
                      </td>
                      <td className="p-4 text-right">Rs {service.net_cost}</td>
                      <td className="p-4 text-right font-medium text-[#1B4D3E]">Rs {service.sell_price}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-600 transition p-2">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}