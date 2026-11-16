import type { SupabaseClient } from '@supabase/supabase-js'
import { LATE_CREDIT_AMOUNT, LATE_GRACE_MINUTES, MAURITIUS_UTC_OFFSET } from './pricing'

/** Scheduled pickup as an absolute instant. pickup_time is Mauritius local time, whatever timezone the server runs in. */
export function scheduledPickupMs(dateISO: string, hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})/.exec(hhmm || '')
  if (!m || !/^\d{4}-\d{2}-\d{2}/.test(dateISO || '')) return null
  const ms = Date.parse(`${dateISO.slice(0, 10)}T${m[1]}:${m[2]}:00${MAURITIUS_UTC_OFFSET}`)
  return Number.isNaN(ms) ? null : ms
}

export function mauritiusToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Indian/Mauritius' }).format(now) // YYYY-MM-DD
}

/**
 * Marks a job as picked up and applies the late-pickup credit once.
 * Idempotent: a second call never overwrites the timestamp or adds a second credit.
 */
export async function completePickup(db: SupabaseClient, jobId: string, now = new Date()) {
  const { data: job, error } = await db
    .from('supplier_bookings')
    .select('id, pickup_time, job_status, late_credit_applied, quotations ( bookings ( id, travel_start, service_credit ) )')
    .eq('id', jobId)
    .single()
  if (error || !job) throw new Error('Job not found')

  if (job.job_status === 'Picked Up' || job.job_status === 'Completed') {
    return { creditApplied: 0, minutesLate: null as number | null, alreadyDone: true }
  }

  const q: any = Array.isArray(job.quotations) ? job.quotations[0] : job.quotations
  const booking: any = Array.isArray(q?.bookings) ? q.bookings[0] : q?.bookings

  // Date of the job: the booking's travel date (same rule the dispatch board uses), else today in Mauritius.
  const jobDate = booking?.travel_start || mauritiusToday(now)
  const scheduled = job.pickup_time ? scheduledPickupMs(jobDate, job.pickup_time) : null
  const minutesLate = scheduled === null ? null : Math.round((now.getTime() - scheduled) / 60000)

  let creditApplied = 0
  if (minutesLate !== null && minutesLate > LATE_GRACE_MINUTES && !job.late_credit_applied && booking?.id) {
    creditApplied = LATE_CREDIT_AMOUNT
    const { error: creditErr } = await db
      .from('bookings')
      .update({ service_credit: (Number(booking.service_credit) || 0) + creditApplied })
      .eq('id', booking.id)
    if (creditErr) creditApplied = 0
  }

  const { error: updErr } = await db
    .from('supplier_bookings')
    .update({
      job_status: 'Picked Up',
      picked_up_at: now.toISOString(),
      disruption_status: 'Resolved',
      late_credit_applied: creditApplied > 0 || !!job.late_credit_applied,
      driver_minutes_late: minutesLate !== null && minutesLate > 0 ? minutesLate : 0,
    })
    .eq('id', jobId)
  if (updErr) throw updErr

  return { creditApplied, minutesLate, alreadyDone: false }
}
