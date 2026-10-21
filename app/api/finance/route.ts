import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Calculate Total Cash Collected (Paid Deposits)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'Paid')
    
    const cashCollected = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

    // 2. Calculate Balances Due (Bookings that are Partially Paid)
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        total_amount,
        quotation_id,
        quotations ( quotation_items ( sell_price, supplier_cost, pax ) )
      `)
      .neq('payment_status', 'Pending')

    let balancesDue = 0
    let totalGrossProfit = 0

    if (bookings) {
      bookings.forEach(booking => {
        // If it's partially paid, the remaining 50% is due
        // In a real app, we would calculate this based on total - payments received
        balancesDue += (Number(booking.total_amount) * 0.5)

        // Calculate GP for this booking
        const items = (booking.quotations as any)?.quotation_items || []
        const revenue = items.reduce((acc: number, item: any) => acc + (item.sell_price * item.pax), 0)
        const cost = items.reduce((acc: number, item: any) => acc + (item.supplier_cost * item.pax), 0)
        totalGrossProfit += (revenue - cost)
      })
    }

    return NextResponse.json({
      cashCollected,
      balancesDue,
      totalGrossProfit
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}