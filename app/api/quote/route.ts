import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const ref = `PA-${new Date().getFullYear()}-${randomNum}`

    // 1. Save the main Quotation (with the chosen currency)
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .insert({
        booking_ref: ref,
        enquiry_id: body.enquiry_id,
        travel_start: body.travel_start,
        subtotal: body.subtotal,
        vat: body.vat,
        total: body.total,
        currency: body.currency, // <-- Saves MUR, USD, or EUR
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