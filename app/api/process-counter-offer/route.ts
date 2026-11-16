import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { MAX_COUNTER_DISCOUNT, round2 } from '../../../lib/pricing'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { quoteId, action, newTotal } = await req.json()
    if (!quoteId || !['accept', 'decline', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const supabase = supabaseAdmin()

    const { data: quote, error: qErr } = await supabase
      .from('quotations').select('id, total, counter_offer_status').eq('id', quoteId).single()
    if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    if (quote.counter_offer_status !== 'Pending') {
      return NextResponse.json({ error: 'There is no pending request on this quote' }, { status: 409 })
    }

    const update: Record<string, any> = { counter_offer_status: action === 'accept' ? 'Accepted' : 'Rejected' }

    if (action === 'accept' && newTotal !== undefined && newTotal !== null && newTotal !== '') {
      const value = Number(newTotal)
      const original = Number(quote.total)
      const floor = round2(original * (1 - MAX_COUNTER_DISCOUNT))
      if (!Number.isFinite(value) || value <= 0 || value > original) {
        return NextResponse.json({ error: 'New total must be a positive number not above the quoted total' }, { status: 400 })
      }
      if (value < floor) {
        return NextResponse.json({ error: `New total cannot be below ${floor} (maximum ${MAX_COUNTER_DISCOUNT * 100}% discount)` }, { status: 400 })
      }
      update.total = round2(value)
    }

    const { error } = await supabase.from('quotations').update(update).eq('id', quoteId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('COUNTER OFFER ERROR:', error)
    return NextResponse.json({ error: 'Could not process the request' }, { status: 500 })
  }
}
