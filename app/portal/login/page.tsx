"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'

export default function ClientLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegistering) {
        // 1. Create the Secure Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        if (authData.user) {
          // 2. Link the Auth User to the existing Customer Record in your DB
          const { error: updateError } = await supabase
            .from('customers')
            .update({ auth_id: authData.user.id })
            .eq('email', email)

          // If the customer record doesn't exist (they are brand new),
          // we create a blank one so they can still log in.
          if (updateError) {
            await supabase.from('customers').insert({
              email: email,
              auth_id: authData.user.id,
              full_name: 'Valued Guest'
            })
          }
        }
        
        // Send them straight to the dashboard
        router.push('/portal/dashboard')
        
      } else {
        // SECURE LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        router.push('/portal/dashboard')
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-6">
      <div className="bg-white p-10 max-w-md w-full shadow-xl border border-[#E5DFD3]">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <img src="/logo-dark.png" alt="Peace and Afrova" className="h-16 w-auto mx-auto" />
          </Link>
          <p className="text-xs tracking-[0.2em] uppercase text-[#3D8B8B]">
            {isRegistering ? 'Create your account' : 'Client Portal'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 text-center border border-red-200">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#1B4D3E] mb-2 font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-b border-[#E5DFD3] bg-transparent py-2 focus:outline-none focus:border-[#C9A961]" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1B4D3E] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#1B4D3E] transition disabled:opacity-50">
            {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button onClick={() => { setIsRegistering(!isRegistering); setError('') }} className="text-xs text-[#3D8B8B] underline block mx-auto">
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register here'}
          </button>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#1B4D3E] block">
            &larr; Back to Website
          </Link>
        </div>
      </div>
    </main>
  )
}