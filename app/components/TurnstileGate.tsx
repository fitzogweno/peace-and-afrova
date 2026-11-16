"use client"

import { useEffect } from 'react'

// Invisible bot check. Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; real visitors normally never see a challenge.
export default function TurnstileGate() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return
    const w = window as any
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => {
      w.turnstile?.render('#ts-gate', {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (token: string) => { w.__turnstileToken = token },
        'expired-callback': () => { w.__turnstileToken = undefined },
        'refresh-expired': 'auto',
      })
    }
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [siteKey])

  if (!siteKey) return null
  return <div id="ts-gate" />
}
