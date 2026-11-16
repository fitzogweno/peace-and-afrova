import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser } from '../../../../lib/portal-auth'

// Dashboard data for the signed-in customer. Also links the Supabase login to the customer record,
// but only once the email address is VERIFIED (otherwise anyone could register someone else's email and claim their trips).
export async function GET(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.confirmed) {
    return NextResponse.json({ error: 'Please confirm your email address using the link we sent you, then sign in again.' }, { status: 403 })
  }

  const db = supabaseAdmin()
  let { data: customer } = await db.from('customers').select('id, full_name').eq('auth_id', user.id).maybeSingle()

  if (!customer) {
    const { data: existing } = await db
      .from('customers').select('id, full_name, auth_id').ilike('email', user.email).is('auth_id', null).limit(1).maybeSingle()
    if (existing) {
      await db.from('customers').update({ auth_id: user.id }).eq('id', existing.id)
      customer = { id: existing.id, full_name: existing.full_name }
    } else {
      const { data: created } = await db
        .from('customers').insert({ email: user.email, auth_id: user.id, full_name: 'Valued Guest' }).select('id, full_name').single()
      customer = created
    }
  }
  if (!customer) return NextResponse.json({ error: 'Could not load your account' }, { status: 500 })

  const { data: bookings } = await db
    .from('bookings')
    .select('*, quotations!inner ( enquiries!inner ( customer_id ) )')
    .eq('quotations.enquiries.customer_id', customer.id)
    .neq('payment_status', 'Pending')
    .order('travel_start', { ascending: true })

  return NextResponse.json({ customer, bookings: bookings || [] }, { headers: { 'Cache-Control': 'no-store' } })
}
