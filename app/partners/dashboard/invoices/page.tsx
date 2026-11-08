"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { Send, Upload, FileText } from 'lucide-react'

export default function PartnerInvoices() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/partners/login'); return }

        const { data: partner } = await supabase.from('partners').select('id').eq('email', session.user.email).single()
        
        if (partner) {
          // For now, we fetch completed or picked-up jobs. 
          // In the future, this will join a dedicated 'partner_invoices' table.
          const { data, error } = await supabase
            .from('supplier_bookings')
            .select(`
              *,
              partner_quotations ( net_amount, currency )
            `)
            .eq('partner_id', partner.id)
            .in('job_status', ['Completed', 'Picked Up'])
            .order('created_at', { ascending: false })
            
          if (data) setInvoices(data)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [router])

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#1B4D3E]">Invoices & Settlements</h1>
        <p className="text-sm text-gray-500 mt-2">Generate invoices for your completed services.</p>
      </div>

      {loading ? (
         <div className="flex items-center justify-center h-64 text-[#1B4D3E] animate-pulse">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 shadow-sm border border-[#E5DFD3]">
          <FileText className="mx-auto text-[#C9A961] mb-4" size={48} strokeWidth={1} />
          <h2 className="font-serif text-2xl text-[#1B4D3E] mb-2">No services to invoice</h2>
          <p>Once you complete a service, you can generate an invoice for it here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#4A4A4A] font-light">
              {invoices.map((invoice) => {
                const quote = Array.isArray(invoice.partner_quotations) ? invoice.partner_quotations[0] : invoice.partner_quotations;
                
                return (
                  <tr key={invoice.id} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                    <td className="p-4">
                      <div className="font-medium text-[#1B4D3E]">{invoice.service_description}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm font-bold bg-green-100 text-green-700">
                        {invoice.job_status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-serif text-lg text-[#1B4D3E]">
                      {quote ? `${quote.currency === 'MUR' ? 'Rs ' : '€'}${quote.net_amount.toLocaleString()}` : 'TBC'}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => alert("Invoice generation module coming soon.")}
                        className="inline-flex items-center gap-2 bg-[#1B4D3E] text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A961] transition"
                      >
                        <Upload size={14} /> Upload Invoice
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}