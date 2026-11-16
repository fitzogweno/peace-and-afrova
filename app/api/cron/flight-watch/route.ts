import { NextResponse } from 'next/server'
import { requireAdminOrCron } from '../../../../lib/auth-admin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { checkBooking, loadWatchCandidates } from '../../../../lib/flight-watch'

export const maxDuration = 60

// Call every 30 minutes (see .github/workflows/flight-watch.yml). Only bookings arriving today or tomorrow, and only inside
// their arrival window, cost an API call.
export async function GET(req: Request) {
  const auth = await requireAdminOrCron(req)
  if (!auth.ok) return auth.response

  try {
    const db = supabaseAdmin()
    const candidates = await loadWatchCandidates(db)
    const results: any[] = []
    for (const q of candidates) {
      const r = await checkBooking(db, q)
      results.push({ ref: q.booking_ref, action: r.action, status: r.status, delayMinutes: r.delayMinutes, message: r.message })
    }
    return NextResponse.json({ checked: results.length, results })
  } catch (error: any) {
    console.error('FLIGHT WATCH ERROR:', error)
    return NextResponse.json({ error: 'Flight watch failed' }, { status: 500 })
  }
}
