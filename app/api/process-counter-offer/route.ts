import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { quoteId, action, newTotal } = await req.json()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    let updateData: any = { counter_offer_status: action === 'accept' ? 'Accepted' : 'Rejected' }

    // If accepting, update the total to the new price the admin entered
    if (action === 'accept' && newTotal) {
      updateData.total = newTotal
    }

    const { error: updateError } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', quoteId)

    if (updateError) throw updateError
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('COUNTER OFFER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}