import { NextResponse, connection } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { rateLimit } from '../../../../lib/rate-limit'

// The emailed link carries the quote reference, which acts as the client's key (8 random characters for new quotes).
export async function GET(req: Request) {
  await connection() // request-time only: never prerender at build (the limiter below catches errors)
  const flood = await rateLimit(req, 'portal-read', 120, 600)
  if (flood) return flood
  const blocked = await rateLimit(req, 'portal-miss', 15, 3600, { peek: true })
  if (blocked) return blocked
  const ref = (new URL(req.url).searchParams.get('ref') || '').trim()
  if (!ref || ref.length > 40 || ref.startsWith('DRAFT-')) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabaseAdmin()
    .from('quotations')
    .select('*, enquiries ( customers (full_name) ), bookings ( service_credit )')
    .eq('booking_ref', ref)
    .single()
  if (error || !data) {
    await rateLimit(req, 'portal-miss', 15, 3600) // count wrong references per visitor
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ quote: data }, { headers: { 'Cache-Control': 'no-store' } })
}
