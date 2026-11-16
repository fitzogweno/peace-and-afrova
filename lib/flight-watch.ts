import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { sendWhatsAppMessage } from './whatsapp'
import { esc } from './html'
import { scheduledPickupMs, mauritiusToday } from './service-guarantee'

const TZ = 'Indian/Mauritius'
const MIN_CHANGE_MINUTES = 15      // ignore flight-time noise smaller than this
const CLIENT_NOTIFY_MINUTES = 30   // tell the client only about delays that matter
const LANDED = ['arrived', 'landed']
const ARRIVAL_IATA = ['MRU', 'SEZ', 'RUN', 'RRG']

export type FlightCheck = {
  ok: boolean
  action: 'none' | 'rescheduled' | 'alert' | 'skipped' | 'error'
  status?: string
  scheduledAt?: string
  estimatedAt?: string
  actualAt?: string | null
  delayMinutes?: number
  newPickupTime?: string | null
  message?: string
}

const parseLocal = (s?: string | null): number | null => {
  if (!s) return null
  const ms = Date.parse(String(s).replace(' ', 'T'))
  return Number.isNaN(ms) ? null : ms
}
const fmtTime = (ms: number) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(ms)
const fmtDate = (ms: number) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(ms)
const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined)

async function fetchFlight(flightNumber: string, date: string) {
  const apiKey = process.env.AERODATABOX_API_KEY
  if (!apiKey) throw new Error('AERODATABOX_API_KEY is not set')
  const host = 'aerodatabox.p.rapidapi.com'
  const url = `https://${host}/flights/number/${encodeURIComponent(flightNumber.replace(/\s+/g, ''))}/${date}?withAircraftImage=false&withLocation=false`
  const res = await fetch(url, { headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': host } })
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) throw new Error(`AeroDataBox ${res.status}`)
  const list = await res.json()
  if (!Array.isArray(list) || list.length === 0) return null
  // The same flight number can have several legs in a day: take the one landing on one of our islands.
  return list.find((f: any) => ARRIVAL_IATA.includes(f?.arrival?.airport?.iata)) || list[0]
}

async function alertAdmin(subject: string, text: string) {
  const to = process.env.ADMIN_ALERT_EMAIL
  const wa = process.env.ADMIN_WHATSAPP_NUMBER
  if (wa) await sendWhatsAppMessage(wa, `${subject}\n\n${text}`).catch((e) => console.error('Admin WhatsApp failed', e))
  if (to && process.env.RESEND_API_KEY) {
    await new Resend(process.env.RESEND_API_KEY).emails
      .send({ from: 'Peace and Afrova <dispatch@peaceandafrova.com>', to: [to], subject, html: `<p>${esc(text).replace(/\n/g, '<br/>')}</p>` })
      .catch((e) => console.error('Admin email failed', e))
  }
}

/**
 * One check of one booking's arrival flight. Moves the arrival pickup by the delay measured against the ORIGINAL schedule,
 * tells the driver (WhatsApp and email, whichever exist) and, for meaningful delays, the client. Logs every decision.
 */
export async function checkBooking(db: SupabaseClient, quotation: any, flightOverride?: string): Promise<FlightCheck> {
  const enquiry: any = one(quotation.enquiries)
  const customer: any = one(enquiry?.customers)
  const flightNumber = (flightOverride || enquiry?.arrival_flight || '').trim()
  if (!enquiry?.id || !flightNumber) return { ok: false, action: 'skipped', message: 'No arrival flight on this booking' }

  const travelDate = String(quotation.travel_start || '').slice(0, 10)
  let flight: any
  try {
    flight = await fetchFlight(flightNumber, travelDate)
  } catch (e: any) {
    return { ok: false, action: 'error', message: e.message }
  }
  if (!flight) return { ok: false, action: 'error', message: 'No flight data found for that flight and date' }

  const arr = flight.arrival || {}
  const status: string = flight.status || 'Unknown'
  const scheduledMs = parseLocal(arr.scheduledTime?.local)
  const estimatedMs = parseLocal(arr.revisedTime?.local) ?? scheduledMs
  const actualMs = parseLocal(arr.actualTime?.local)
  if (scheduledMs === null || estimatedMs === null) return { ok: false, action: 'error', message: 'Flight data has no arrival time' }

  // Baseline is the first schedule we ever saw, so a delay that grows in steps is still measured from the original time.
  const baseline = parseLocal(enquiry.scheduled_arrival_at) ?? scheduledMs
  const effective = actualMs ?? estimatedMs
  const delay = Math.max(Math.round((effective - baseline) / 60000), 0)

  await db.from('enquiries').update({
    flight_status: status,
    estimated_arrival: new Date(effective).toISOString(),
    actual_arrival: actualMs ? new Date(actualMs).toISOString() : null,
    scheduled_arrival_at: new Date(baseline).toISOString(),
    flight_checked_at: new Date().toISOString(),
  }).eq('id', enquiry.id)

  const base: FlightCheck = {
    ok: true, action: 'none', status, delayMinutes: delay,
    scheduledAt: new Date(baseline).toISOString(), estimatedAt: new Date(effective).toISOString(),
    actualAt: actualMs ? new Date(actualMs).toISOString() : null, newPickupTime: null,
  }
  const log = (action: string, note = '') =>
    db.from('flight_events').insert({
      quotation_id: quotation.id, flight_number: flightNumber, flight_status: status,
      scheduled_at: base.scheduledAt, estimated_at: base.estimatedAt, delay_minutes: delay, action, note,
    })

  if (['canceled', 'cancelled', 'diverted'].includes(status.toLowerCase())) {
    await alertAdmin(`Flight ${flightNumber} ${status}`, `Booking ${quotation.booking_ref} (${customer?.full_name || 'client'}): flight ${flightNumber} is ${status}. Please contact the client and the driver.`)
    await log('alert', status)
    return { ...base, action: 'alert', message: `Flight ${status}: admin alerted, no automatic change made` }
  }

  const all: any[] = Array.isArray(quotation.supplier_bookings) ? quotation.supplier_bookings : []
  const arrivals = all.filter((j) => /arriv/i.test(j.service_description || ''))
  const jobs = (arrivals.length ? arrivals : all.length === 1 ? all : []).filter((j) => !['Picked Up', 'Completed'].includes(j.job_status))
  if (!jobs.length) { await log('none', 'no open arrival transfer'); return { ...base, message: 'No open arrival transfer to adjust' } }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://peaceandafrova.com'
  let moved = false
  for (const job of jobs) {
    const applied = Number(job.delay_minutes) || 0
    if (Math.abs(delay - applied) < MIN_CHANGE_MINUTES) continue

    const basePickup: string = job.original_pickup_time || job.pickup_time
    if (!basePickup) continue
    const baseMs = scheduledPickupMs(travelDate, basePickup)
    if (baseMs === null) continue
    const newMs = Math.round((baseMs + delay * 60000) / 300000) * 300000 // nearest 5 minutes
    const newPickup = fmtTime(newMs)
    const nextDay = fmtDate(newMs) !== travelDate
    const backOnTime = delay < MIN_CHANGE_MINUTES

    const { error } = await db.from('supplier_bookings').update({
      pickup_time: newPickup,
      original_pickup_time: job.original_pickup_time || job.pickup_time,
      delay_minutes: delay,
      disruption_status: backOnTime ? 'Resolved' : 'Notified',
    }).eq('id', job.id)
    if (error) { console.error('Could not move pickup', error); continue }
    moved = true
    base.newPickupTime = newPickup

    const link = job.access_token ? `${origin}/driver/job/${job.access_token}` : ''
    const eta = fmtTime(effective)
    const who = customer?.full_name || 'the client'
    const driverText = backOnTime
      ? `Flight ${flightNumber} for ${who} is back on schedule (ETA ${eta}). Pickup is back to ${newPickup}.${link ? `\n\nJob: ${link}` : ''}`
      : `FLIGHT DELAY: ${flightNumber} for ${who} is ${delay} min late (ETA ${eta}). Your pickup is now ${newPickup}${nextDay ? ' (next day)' : ''}.${link ? `\n\nJob: ${link}` : ''}`

    if (job.driver_phone) await sendWhatsAppMessage(job.driver_phone, `Hi ${job.driver_name || 'driver'}, ${driverText}`).catch((e) => console.error('Driver WhatsApp failed', e))
    if (job.driver_email && process.env.RESEND_API_KEY) {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: 'Peace and Afrova <dispatch@peaceandafrova.com>', to: [job.driver_email],
        subject: backOnTime ? `Back on schedule: ${who}` : `FLIGHT DELAY: new pickup ${newPickup} for ${who}`,
        html: `<div style="font-family:sans-serif;max-width:560px"><p>Hi ${esc(job.driver_name || 'driver')},</p><p>${esc(driverText).replace(/\n/g, '<br/>')}</p></div>`,
      }).catch((e) => console.error('Driver email failed', e))
    }

    if (customer?.email && process.env.RESEND_API_KEY && delay >= CLIENT_NOTIFY_MINUTES && !backOnTime) {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: 'Peace and Afrova <concierge@peaceandafrova.com>', to: [customer.email],
        subject: 'A quick update on your arrival',
        html: `<div style="font-family:Georgia,serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;background:#F5F0E6">
          <h2 style="color:#1B4D3E;font-weight:normal">Peace and Afrova</h2>
          <p>Dear ${esc(customer.full_name)},</p>
          <p>We can see that flight ${esc(flightNumber)} is now expected at <strong>${esc(eta)}</strong>. We have already adjusted your chauffeur, so there is nothing you need to do.</p>
          <p>Your driver will be waiting for you when you arrive.</p>
          <p>Warm regards,<br/>The Peace and Afrova Team</p></div>`,
      }).catch((e) => console.error('Client email failed', e))
    }
  }

  await log(moved ? 'rescheduled' : 'none', moved ? `pickup moved to ${base.newPickupTime}` : 'change below threshold')
  return { ...base, action: moved ? 'rescheduled' : 'none' }
}

/** Which bookings are worth a (paid) API call right now. */
export function shouldPoll(quotation: any, now = new Date()): boolean {
  const enquiry: any = one(quotation.enquiries)
  if (!enquiry?.arrival_flight) return false
  if (LANDED.includes(String(enquiry.flight_status || '').toLowerCase())) return false
  const sched = parseLocal(enquiry.scheduled_arrival_at)
  const checked = parseLocal(enquiry.flight_checked_at)
  if (sched === null) return !checked || now.getTime() - checked > 6 * 3600_000 // first look to learn the schedule
  return now.getTime() >= sched - 8 * 3600_000 && now.getTime() <= sched + 4 * 3600_000
}

export async function loadWatchCandidates(db: SupabaseClient, now = new Date()) {
  const today = mauritiusToday(now)
  const tomorrow = mauritiusToday(new Date(now.getTime() + 86_400_000))
  const { data, error } = await db
    .from('quotations')
    .select(`
      id, booking_ref, travel_start,
      enquiries ( id, arrival_flight, flight_status, scheduled_arrival_at, flight_checked_at, customers ( full_name, email ) ),
      supplier_bookings ( id, service_description, pickup_time, original_pickup_time, delay_minutes, driver_name, driver_phone, driver_email, access_token, job_status )
    `)
    .in('travel_start', [today, tomorrow])
  if (error) throw error
  return (data || []).filter((q) => shouldPoll(q, now))
}
