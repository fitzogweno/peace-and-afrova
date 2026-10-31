import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Calculate Cash Collected
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'Paid')
    const cashCollected = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

    // 2. Fetch Bookings and their Quotation Items for deep analysis
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        total_amount,
        payment_status,
        created_at,
        quotations ( quotation_items ( sell_price, supplier_cost, pax ) )
      `)
      .neq('payment_status', 'Pending')

    let balancesDue = 0
    let totalRevenue = 0
    let totalCost = 0
    const monthlyData: Record<string, { revenue: number, profit: number }> = {}

    if (bookings) {
      bookings.forEach((booking: any) => {
        // Balances due
        if (booking.payment_status === 'Partially Paid') {
          balancesDue += (Number(booking.total_amount) * 0.5)
        }

        // Safely extract quotation items (handles both array and object returns)
        const quotation = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
        const items = quotation?.quotation_items || []
        
        const revenue = items.reduce((acc: number, item: any) => acc + (item.sell_price * item.pax), 0)
        const cost = items.reduce((acc: number, item: any) => acc + (item.supplier_cost * item.pax), 0)
        
        totalRevenue += revenue
        totalCost += cost

        // Monthly breakdown (e.g., "Oct", "Nov")
        const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' })
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, profit: 0 }
        monthlyData[month].revenue += revenue
        monthlyData[month].profit += (revenue - cost)
      })
    }

    // Convert monthly data to array for Recharts
    const chartData = Object.keys(monthlyData).map(month => ({
      month,
      revenue: monthlyData[month].revenue,
      profit: monthlyData[month].profit
    }))

    return NextResponse.json({
      cashCollected,
      balancesDue,
      totalRevenue,
      totalCost,
      totalGrossProfit: totalRevenue - totalCost,
      chartData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}