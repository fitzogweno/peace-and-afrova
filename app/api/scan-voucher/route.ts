import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { rateLimit, clientIp } from '../../../lib/rate-limit'

// The voucher QR is shown to the CLIENT, so scanning it proves who the passenger is.
// It must not mark the job as picked up (that is the driver's authenticated action, and it drives the
// late-pickup credit). It only records that the voucher was presented.
export async function POST(req: Request) {
  const limited = await rateLimit(req, 'scan', 60, 600)
  if (limited) return limited
  try {
    const { voucherId } = await req.json()
    if (!voucherId) return NextResponse.json({ error: 'Invalid voucher' }, { status: 400 })
    const { error } = await supabaseAdmin()
      .from('supplier_bookings')
      .update({ voucher_scanned_at: new Date().toISOString() })
      .eq('id', voucherId)
      .is('voucher_scanned_at', null)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SCAN VOUCHER ERROR:', error)
    return NextResponse.json({ error: 'Could not record the scan' }, { status: 500 })
  }
}
