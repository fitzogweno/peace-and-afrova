"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase' // <-- FIXED PATH HERE
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export default function PartnerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        // Successfully logged in - redirect to partner dashboard
        router.push('/partners/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1B4D3E] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#F5F0E6] p-10 md:p-16 max-w-md w-full shadow-2xl">
        <div className="text-center mb-10">
          <Building2 className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h1 className="font-serif text-3xl text-[#1B4D3E] mb-2">Partner Portal</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] font-medium">Peace and Afrova</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-sm mb-6 text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Business Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-[#1B4D3E]/30 bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition text-[#1A1A1A]" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-[#1B4D3E]/30 bg-transparent py-2 focus:outline-none focus:border-[#C9A961] transition text-[#1A1A1A]" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50 font-bold mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Not yet a partner? <Link href="/partners" className="text-[#1B4D3E] underline font-bold">Apply Here</Link>
          </p>
        </div>
      </div>
    </main>
  )
}