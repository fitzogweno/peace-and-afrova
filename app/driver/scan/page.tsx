"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

function ScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const voucherId = searchParams.get('voucherId') || ''
  const clientName = searchParams.get('client') || 'Client'
  
  const [isConfirming, setIsConfirming] = useState(false)
  const [success, setSuccess] = useState(false)

  async function confirmPickup() {
    setIsConfirming(true)
    const res = await fetch('/api/scan-voucher', {
      method: 'POST',
      body: JSON.stringify({ voucherId })
    })
    
    if (res.ok) {
      setSuccess(true)
    } else {
      alert("Failed to scan voucher. Please try again.")
    }
    setIsConfirming(false)
  }

  return (
    <div className="min-h-screen bg-[#1B4D3E] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 md:p-12 shadow-2xl max-w-md w-full">
        {success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="font-serif text-3xl text-[#1B4D3E] mb-2">Pickup Confirmed</h1>
            <p className="text-gray-600 mb-8">The office has been notified. Have a safe journey, {clientName}.</p>
            <button onClick={() => router.push('/driver')} className="bg-[#1B4D3E] text-white px-6 py-3 text-sm tracking-widest uppercase">Return to Portal</button>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-3xl text-[#1B4D3E] mb-2">Scan Voucher</h1>
            <p className="text-gray-600 mb-8">You are about to confirm pickup for <strong>{clientName}</strong>.</p>
            
            <button 
              onClick={confirmPickup} 
              disabled={isConfirming}
              className="w-full bg-green-600 text-white py-6 text-lg tracking-widest uppercase font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Pickup'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DriverScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1B4D3E] flex items-center justify-center text-white">Loading...</div>}>
      <ScanContent />
    </Suspense>
  )
}