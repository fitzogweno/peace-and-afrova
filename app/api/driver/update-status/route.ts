import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { isUuid } from '../../../../lib/html'
import { completePickup } from '../../../../lib/service-guarantee'

const ORDER = ['Pending', 'Accepted', 'En Route', 'Picked Up', 'Completed']

export async function POST(req: Request) {
  try {
    const { token, newStatus } = await req.json()
    if (!isUuid(token) || !ORDER.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const db = supabaseAdmin()

    const { data: job } = await db
      .from('supplier_bookings').select('id, job_status').eq('access_token', token).single()
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Status only moves forward.
    const current = ORDER.indexOf(job.job_status || 'Pending')
    if (ORDER.indexOf(newStatus) <= current) {
      return NextResponse.json({ success: true, creditApplied: 0, unchanged: true })
    }

    if (newStatus === 'Picked Up') {
      const result = await completePickup(db, job.id)
      return NextResponse.json({ success: true, creditApplied: result.creditApplied })
    }

    const update: Record<string, any> = { job_status: newStatus }
    if (newStatus === 'Accepted') {
      update.driver_acknowledged_at = new Date().toISOString()
      update.disruption_status = 'Acknowledged'
    }
    if (newStatus === 'Completed') update.disruption_status = 'Resolved'

    const { error } = await db.from('supplier_bookings').update(update).eq('id', job.id)
    if (error) throw error
    return NextResponse.json({ success: true, creditApplied: 0 })
  } catch (error: any) {
    console.error('DRIVER STATUS ERROR:', error)
    return NextResponse.json({ error: 'Could not update status' }, { status: 500 })
  }
}
