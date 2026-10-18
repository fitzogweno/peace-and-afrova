"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // This forces the button to reset if the user hits the "Back" button
  useEffect(() => {
    setLoading(false)
    setError('')
    setPassword('')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Save a cookie so the dashboard knows you are logged in
        document.cookie = "admin_session=true; path=/"
        router.push('/admin')
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Check your console.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1B4D3E] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#F5F0E6] p-10 md:p-16 max-w-md w-full shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-[#1B4D3E] mb-2">Admin Portal</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B] font-medium">Peace and Afrova</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-sm mb-6 text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Email</label>
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
            className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#2A6B58] transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}