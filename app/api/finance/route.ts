import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch all bookings with their linked quotations and line items
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        quotations (
          id, total, subtotal, vat, payment_status,
          quotation_items ( * )
        )
      `)

    if (error) throw error

    let cashCollected = 0
    let balancesDue = 0
    let totalGrossProfit = 0

    // 2. Iterate and calculate true profits
    bookings?.forEach((booking: any) => {
      const quote = Array.isArray(booking.quotations) ? booking.quotations[0] : booking.quotations;
      if (!quote) return;

      // --- CASH FLOW ---
      if (booking.payment_status === 'Paid') {
        cashCollected += quote.total;
      } else if (booking.payment_status === 'Partially Paid') {
        // Assuming 30% deposit rule (adjust if you have a deposit column)
        const deposit = quote.total * 0.30; 
        cashCollected += deposit;
        balancesDue += (quote.total - deposit);
      } else {
        balancesDue += quote.total;
      }

      // --- TRUE GROSS PROFIT ---
      // Revenue is the actual subtotal agreed (Total minus VAT).
      // Cost is the sum of all supplier costs.
      const actualRevenue = quote.total - quote.vat;
      
      const items = quote.quotation_items || [];
      const totalSupplierCost = items.reduce((acc: number, item: any) => {
        return acc + (item.supplier_cost * item.pax);
      }, 0);

      totalGrossProfit += (actualRevenue - totalSupplierCost);
    })

    return NextResponse.json({
      cashCollected,
      balancesDue,
      totalGrossProfit,
      chartData: [] // (Add your chart logic here if needed)
    })
  } catch (error: any) {
    console.error("FINANCE API ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}