import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { DEPOSIT_RATE, round2 } from '../../../lib/pricing'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const supabase = supabaseAdmin()
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, payment_status, travel_start, service_credit,
        quotations ( id, total, subtotal, vat, quotation_items ( supplier_cost, pax ) )
      `)
    if (error) throw error

    let cashCollected = 0
    let balancesDue = 0
    let totalGrossProfit = 0
    const byMonth = new Map<string, { sort: string; month: string; revenue: number; profit: number }>()

    for (const booking of bookings || []) {
      const quote: any = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations
      if (!quote) continue

      // All stored amounts are MUR. The client pays total minus any service-guarantee credit.
      const credit = Number(booking.service_credit) || 0
      const total = Number(quote.total) || 0
      const payable = Math.max(total - credit, 0)

      if (booking.payment_status === 'Paid') {
        cashCollected += payable
      } else if (booking.payment_status === 'Partially Paid') {
        const deposit = payable * DEPOSIT_RATE
        cashCollected += deposit
        balancesDue += payable - deposit
      } else {
        balancesDue += payable // Pending: nothing received yet
      }

      // Revenue excludes VAT. The late-pickup credit is a real cost to us, so it reduces profit.
      const revenue = total - (Number(quote.vat) || 0) - credit
      const supplierCost = (quote.quotation_items || []).reduce(
        (acc: number, it: any) => acc + (Number(it.supplier_cost) || 0) * (Number(it.pax) || 0), 0)
      const profit = revenue - supplierCost
      totalGrossProfit += profit

      const d = booking.travel_start ? new Date(booking.travel_start) : null
      if (d && !Number.isNaN(d.getTime())) {
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
        const row = byMonth.get(key) || { sort: key, month: `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`, revenue: 0, profit: 0 }
        row.revenue += revenue
        row.profit += profit
        byMonth.set(key, row)
      }
    }

    const chartData = [...byMonth.values()]
      .sort((a, b) => a.sort.localeCompare(b.sort))
      .map(({ month, revenue, profit }) => ({ month, revenue: round2(revenue), profit: round2(profit) }))

    return NextResponse.json({
      cashCollected: round2(cashCollected),
      balancesDue: round2(balancesDue),
      totalGrossProfit: round2(totalGrossProfit),
      chartData,
    })
  } catch (error: any) {
    console.error('FINANCE API ERROR:', error)
    return NextResponse.json({ error: 'Failed to load finance data' }, { status: 500 })
  }
}
