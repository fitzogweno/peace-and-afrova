"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car } from 'lucide-react'
import Link from 'next/link'

export default function DriverLogin() {
  const router = useRouter()
  const [name, setName] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    // We store the driver's name in a cookie to identify them
    document.cookie = `driver_session=${name}; path=/`
    router.push('/driver/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#1B4D3E] flex items-center justify-center p-6">
      <div className="bg-[#F5F0E6] p-8 md:p-12 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <Car className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h1 className="font-serif text-3xl text-[#1B4D3E] mb-2">Driver Portal</h1>
          <p className="text-xs tracking-widest uppercase text-[#3D8B8B]">Peace and Afrova</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Enter Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rishi"
              className="w-full border-b border-[#1B4D3E]/30 bg-transparent py-2 focus:outline-none focus:border-[#C9A961] text-lg" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition">
            View My Jobs
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#1B4D3E]">Return to Website</Link>
        </div>
      </div>
    </main>
  )
}