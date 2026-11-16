import { NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Fixed-window limiter backed by Postgres (works across serverless instances, no extra service to pay for).
 * Returns a 429 response when the caller is over the limit, otherwise null. Fails OPEN if the database call fails,
 * so a limiter problem never blocks a real client from booking.
 * peek: true checks the counter without adding to it.
 */
export async function rateLimit(
  req: Request, name: string, max: number, windowSeconds: number, opts: { peek?: boolean } = {}
): Promise<NextResponse | null> {
  try {
    const { data, error } = await supabaseAdmin().rpc('rate_limit_hit', {
      p_key: `${name}:${clientIp(req)}`,
      p_window_seconds: windowSeconds,
      p_max: max,
      p_increment: !opts.peek,
    })
    if (error) { console.error('Rate limiter error:', error.message); return null }
    if (data === false) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(windowSeconds) } }
      )
    }
  } catch (err) {
    console.error('Rate limiter unavailable:', err)
  }
  return null
}
