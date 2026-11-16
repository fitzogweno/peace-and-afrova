import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { id, pickup_time } = await req.json()
    if (!id || typeof pickup_time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(pickup_time)) {
      return NextResponse.json({ error: 'Invalid pickup time' }, { status: 400 })
    }
    const { error } = await supabaseAdmin().from('supplier_bookings').update({ pickup_time }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('UPDATE PICKUP ERROR:', error)
    return NextResponse.json({ error: 'Could not update pickup time' }, { status: 500 })
  }
}
