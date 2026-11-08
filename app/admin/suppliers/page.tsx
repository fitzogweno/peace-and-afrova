"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Trophy, AlertTriangle } from 'lucide-react'

export default function SupplierScorecard() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSupplierData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      const { data } = await supabase.from('supplier_bookings').select('driver_name, job_status, delay_minutes, driver_acknowledged_at, disruption_status').not('driver_name', 'is', null)

      if (data) {
        const stats = data.reduce((acc: any, job: any) => {
          const name = job.driver_name
          if (!acc[name]) acc[name] = { name, totalJobs: 0, lateJobs: 0, totalDelayMins: 0, unacknowledged: 0 }
          acc[name].totalJobs += 1
          if (job.delay_minutes > 0) { acc[name].lateJobs += 1; acc[name].totalDelayMins += job.delay_minutes }
          if (job.disruption_status === 'Notified') acc[name].unacknowledged += 1
          return acc
        }, {})

        const supplierArray = Object.values(stats).map((s: any) => {
          const onTimeRate = s.totalJobs === 0 ? 100 : Math.round(((s.totalJobs - s.lateJobs) / s.totalJobs) * 100)
          return { ...s, onTimeRate }
        }).sort((a, b) => b.onTimeRate - a.onTimeRate)

        setSuppliers(supplierArray)
      }
      setLoading(false)
    }
    fetchSupplierData()
  }, [router])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-4xl text-[#1B4D3E]">Supplier Performance</h1>
          <p className="text-sm text-gray-500 mt-1">Data-driven partner reliability scorecard.</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gray-500">Total Active Drivers</div>
          <div className="font-serif text-2xl text-[#1B4D3E]">{suppliers.length}</div>
        </div>
      </div>
      
      {loading ? (
        <p className="text-[#4A4A4A]">Calculating scorecards...</p>
      ) : (
        <div className="bg-white shadow-sm border border-[#E5DFD3] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E5DFD3] text-xs tracking-widest uppercase text-[#3D8B8B]">
                <th className="p-4 font-medium">Driver / Supplier</th>
                <th className="p-4 font-medium text-center">Total Jobs</th>
                <th className="p-4 font-medium text-center">On-Time Rate</th>
                <th className="p-4 font-medium text-center">Late Arrivals</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#4A4A4A] font-light">
              {suppliers.map((driver) => (
                <tr key={driver.name} className="border-b border-[#E5DFD3] hover:bg-[#FAF7F0] transition">
                  <td className="p-4 font-medium text-[#1B4D3E]">{driver.name}</td>
                  <td className="p-4 text-center">{driver.totalJobs}</td>
                  <td className="p-4 text-center font-bold">
                    <span className={driver.onTimeRate >= 90 ? 'text-green-600' : driver.onTimeRate >= 70 ? 'text-orange-500' : 'text-red-600'}>{driver.onTimeRate}%</span>
                  </td>
                  <td className="p-4 text-center">{driver.lateJobs}</td>
                  <td className="p-4 text-center">
                    {driver.onTimeRate >= 90 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded"><Trophy size={12}/> Preferred</span>
                    ) : driver.onTimeRate < 70 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded"><AlertTriangle size={12}/> Review</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}