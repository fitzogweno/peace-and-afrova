import { makeRef } from '../../../lib/refs'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { esc } from '../../../lib/html'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const supabase = supabaseAdmin()

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'A quote needs at least one line item' }, { status: 400 })
    }
    const sub = Number(body.subtotal), vat = Number(body.vat), total = Number(body.total)
    if (![sub, vat, total].every(Number.isFinite) || sub < 0 || Math.abs(sub + vat - total) > 0.05) {
      return NextResponse.json({ error: 'Totals do not add up (subtotal + VAT must equal total)' }, { status: 400 })
    }
    const ref = makeRef('PA')

    // 1. Save the main Quotation (with the chosen currency and locked FX rate)
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .insert({
        booking_ref: ref,
        enquiry_id: body.enquiry_id,
        travel_start: body.travel_start,
        subtotal: body.subtotal,
        vat: body.vat,
        total: body.total,
        currency: body.currency,
        exchange_rate: body.exchange_rate, // <-- SAVED HERE
        status: 'draft',
        quote_status: 'Draft'
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // 2. Save the Line Items
    const lineItems = body.items.map((item: any) => ({
      quotation_id: quotation.id,
      description: item.desc,
      pax: item.pax,
      supplier_cost: item.cost,
      sell_price: item.sell,
      vat_amount: (item.sell * item.pax) * 0.15,
      total_line: (item.sell * item.pax)
    }))

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(lineItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ success: true, ref })
  } catch (error: any) {
    console.error('QUOTE SAVE ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}