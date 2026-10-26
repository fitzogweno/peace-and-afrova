"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Printer, Save, Percent, Send, Gift, FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { useApp } from '../../context/AppContext'

function BuilderContent() {
  const searchParams = useSearchParams()
  const enquiryId = searchParams.get('id') || ''
  const { rates } = useApp()

  const [customerName, setCustomerName] = useState('Loading...')
  const [customerEmail, setCustomerEmail] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [enquiryDetails, setEnquiryDetails] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [savedRef, setSavedRef] = useState('')
  
  const [catalog, setCatalog] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [quoteCurrency, setQuoteCurrency] = useState('MUR')

  const [items, setItems] = useState([{ id: 1, desc: '', pax: 1, cost: 0, sell: 0 }])

  useEffect(() => {
    if (!enquiryId) return
    async function fetchData() {
      const { data: clientData } = await supabase
        .from('enquiries')
        .select(`travel_start, party_size, interests, has_hotel, hotel_details, hotel_budget, hotel_location, hotel_vibe, customers (full_name, email)`)
        .eq('id', enquiryId)
        .single()
      
      if (clientData) {
        setEnquiryDetails(clientData)
        // @ts-ignore
        setCustomerName(clientData.customers.full_name)
        // @ts-ignore
        setCustomerEmail(clientData.customers.email)
        setTravelDate(clientData.travel_start)
      }

      const { data: serviceData } = await supabase.from('services').select('*').order('category', { ascending: true })
      if (serviceData) setCatalog(serviceData)
    }
    fetchData()
  }, [enquiryId])

  const handleAddFromCatalog = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value
    if (!serviceId) return
    const service = catalog.find(s => s.id === serviceId)
    if (service) {
      setItems([...items, { id: Date.now(), desc: `${service.name}`, pax: 1, cost: service.net_cost, sell: service.sell_price }])
    }
    setSelectedServiceId('')
  }

  const addItem = () => setItems([...items, { id: Date.now(), desc: '', pax: 1, cost: 0, sell: 0 }])
  const removeItem = (id: number) => setItems(items.filter(item => item.id !== id))
  const updateItem = (id: number, field: string, value: any) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))

  const rawSubtotal = items.reduce((acc, item) => acc + (item.sell * item.pax), 0)
  const discountAmount = rawSubtotal * (discountPercent / 100)
  const discountedSubtotal = rawSubtotal - discountAmount
  const vat = discountedSubtotal * 0.15
  const totalMUR = discountedSubtotal + vat

  const formatPrice = (amountInMUR: number) => {
    if (quoteCurrency === 'MUR') return `Rs ${amountInMUR.toLocaleString()}`
    const rate = rates[quoteCurrency] || 1
    const converted = amountInMUR * rate
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quoteCurrency,
      maximumFractionDigits: 0
    }).format(converted)
  }

  async function handleSave() {
    setIsSaving(true)
    const res = await fetch('/api/quote', {
      method: 'POST',
      body: JSON.stringify({ enquiry_id: enquiryId, travel_start: travelDate, subtotal: discountedSubtotal, vat, total: totalMUR, currency: quoteCurrency, items })
    })
    if (res.ok) {
      const data = await res.json()
      setSavedRef(data.ref)
      alert(`Proforma Invoice saved! Reference: ${data.ref}`)
    } else {
      alert('Failed to save quote.')
    }
    setIsSaving(false)
  }

  async function handleSendEmail() {
    if (!savedRef) return alert("Please save the Proforma Invoice first.")
    setIsSending(true)
    const res = await fetch('/api/send-quote', {
      method: 'POST',
      body: JSON.stringify({ quoteRef: savedRef, clientEmail: customerEmail, clientName: customerName, currency: quoteCurrency, language: 'EN' })
    })
    if (res.ok) alert(`Proforma Invoice successfully sent to ${customerEmail}!`)
    else alert('Failed to send email.')
    setIsSending(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col font-sans text-[#1A1A1A]">
      <nav className="bg-[#1B4D3E] text-white px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="hover:text-[#C9A961] transition"><ArrowLeft size={20} /></Link>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-[#C9A961]">Proforma Invoice Builder</div>
            <div className="font-serif text-lg">Client: {customerName}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#133A2E] border border-[#C9A961] rounded-sm px-3 py-1">
            <select value={quoteCurrency} onChange={(e) => setQuoteCurrency(e.target.value)} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
              <option value="MUR" className="text-black">MUR (Rs)</option>
              <option value="USD" className="text-black">USD ($)</option>
              <option value="EUR" className="text-black">EUR (€)</option>
              <option value="GBP" className="text-black">GBP (£)</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#C9A961] text-[#1B4D3E] px-6 py-2 text-sm font-medium hover:bg-white transition disabled:opacity-50"><Save size={16} /> {isSaving ? 'Saving...' : 'Save'}</button>
          <button onClick={handleSendEmail} disabled={isSending || !savedRef} className="flex items-center gap-2 bg-[#3D8B8B] text-white px-6 py-2 text-sm font-medium hover:bg-[#2C6B6B] transition disabled:opacity-50"><Send size={16} /> {isSending ? 'Sending...' : 'Send to Client'}</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 border border-white/30 text-white px-6 py-2 text-sm font-medium hover:bg-white/10 transition"><Printer size={16} /> Print</button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 my-8 bg-white shadow-lg print:shadow-none print:my-0 print:p-0">
        
        {/* CLIENT BRIEF BOX */}
        {enquiryDetails && (
          <div className="bg-[#FAF7F0] border-l-4 border-[#C9A961] p-6 mb-8 print:border-none print:p-0">
            <h3 className="font-serif text-xl text-[#1B4D3E] mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#C9A961]"/> Client Brief
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
              <div>
                <span className="block text-xs uppercase text-gray-500 mb-1">Travel Start</span>
                <strong>{enquiryDetails.travel_start}</strong>
              </div>
              <div>
                <span className="block text-xs uppercase text-gray-500 mb-1">Party Size</span>
                <strong>{enquiryDetails.party_size} Persons</strong>
              </div>
              <div className="col-span-2">
                <span className="block text-xs uppercase text-gray-500 mb-1">Interests</span>
                <strong>{enquiryDetails.interests || 'None specified'}</strong>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#E5DFD3]">
              <span className="block text-xs uppercase text-gray-500 mb-2">Hotel Requirements</span>
              {enquiryDetails.has_hotel === 'yes' ? (
                <p className="text-sm text-green-700 font-medium">
                  Booked: {enquiryDetails.hotel_details || 'Details not provided'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-4 text-sm bg-orange-50 text-orange-700 p-3 rounded-sm border border-orange-200">
                  <span><strong>Needs Booking:</strong></span>
                  <span>Budget: {enquiryDetails.hotel_budget || 'Any'}</span>
                  <span>Location: {enquiryDetails.hotel_location || 'Any'}</span>
                  <span>Vibe: {enquiryDetails.hotel_vibe || 'Any'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-start border-b border-[#E5DFD3] pb-8 mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#1B4D3E] mb-2">Proforma Invoice</h1>
            <p className="text-sm text-gray-500">Ref: {savedRef || 'Draft'}</p>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="font-serif text-xl text-[#1B4D3E]">Peace and Afrova</div>
            <div className="text-sm text-gray-500">Group Company Ltd</div>
            <div className="text-sm text-gray-500 mt-2">Curepipe Forest Side, Mauritius</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Currency: {quoteCurrency}</div>
          </div>
        </div>

        <div className="print:hidden mb-8 bg-[#FAF7F0] p-4 border border-[#E5DFD3] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#1B4D3E]">Quick Add (Catalog):</span>
            <select value={selectedServiceId} onChange={handleAddFromCatalog} className="border border-[#1B4D3E]/30 bg-white p-2 text-sm focus:outline-none focus:border-[#C9A961] w-64">
              <option value="">Select a service...</option>
              {catalog.map(service => <option key={service.id} value={service.id}>{service.name} (Rs {service.sell_price})</option>)}
            </select>
          </div>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-[#1B4D3E] text-xs tracking-widest uppercase text-[#1B4D3E]">
              <th className="py-2 font-medium">Service Description</th><th className="py-2 font-medium text-center w-20">Pax</th><th className="py-2 font-medium text-right w-32 print:hidden">Net Cost</th><th className="py-2 font-medium text-right w-32">Sell Price</th><th className="py-2 font-medium text-right w-32">Total</th><th className="print:hidden w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#E5DFD3] group">
                <td className="py-4 pr-4"><input type="text" value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} placeholder="Enter service" className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-[#1A1A1A] print:appearance-none" /></td>
                <td className="py-4 text-center"><input type="number" value={item.pax} onChange={(e) => updateItem(item.id, 'pax', parseInt(e.target.value))} className="w-16 text-center bg-transparent border-none focus:ring-0 p-0 text-sm print:appearance-none" /></td>
                <td className="py-4 text-right print:hidden"><input type="number" value={item.cost} onChange={(e) => updateItem(item.id, 'cost', parseFloat(e.target.value))} className="w-24 text-right bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-400" /></td>
                <td className="py-4 text-right"><input type="number" value={item.sell} onChange={(e) => updateItem(item.id, 'sell', parseFloat(e.target.value))} className="w-24 text-right bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-[#1B4D3E] print:appearance-none" /></td>
                <td className="py-4 text-right font-medium text-sm">{formatPrice(item.sell * item.pax)}</td>
                <td className="print:hidden text-center"><button onClick={() => removeItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition p-2"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem} className="print:hidden flex items-center gap-2 text-sm text-[#3D8B8B] hover:text-[#1B4D3E] transition mb-12"><Plus size={16} /> Add Custom Line</button>

        {totalMUR > 40000 && (
          <div className="bg-[#FAF7F0] border-l-4 border-[#C9A961] p-4 mb-6 flex items-center gap-3 print:hidden">
            <Gift className="text-[#C9A961]" size={24} />
            <div>
              <p className="font-medium text-[#1B4D3E]">VIP Gift Eligible</p>
              <p className="text-sm text-gray-600">This order is over Rs 40,000. Remember to offer the complimentary premium notebook.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-16">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatPrice(rawSubtotal)}</span></div>
            <div className="flex justify-between items-center text-sm text-[#C9A961] border-b border-[#E5DFD3] pb-3 print:border-none">
              <span className="flex items-center gap-1"><Percent size={14}/> Discount</span>
              <div className="flex items-center gap-2">
                <input type="number" min="0" max="100" value={discountPercent || ''} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} className="w-16 text-right bg-transparent border border-[#C9A961] rounded px-2 py-1 text-sm text-[#C9A961] focus:outline-none print:hidden" placeholder="0" />
                <span className="print:hidden">%</span><span className="hidden print:inline">({discountPercent}%)</span>
              </div>
            </div>
            {discountPercent > 0 && <div className="flex justify-between text-sm text-green-700"><span>Discount Amount</span><span>- {formatPrice(discountAmount)}</span></div>}
            <div className="flex justify-between text-sm text-gray-600"><span>VAT (15% on discounted total)</span><span>{formatPrice(vat)}</span></div>
            <div className="flex justify-between text-xl font-serif text-[#1B4D3E] border-t-2 border-[#1B4D3E] pt-3"><span>Total</span><span>{formatPrice(totalMUR)}</span></div>
          </div>
        </div>

        <div className="bg-[#FAF7F0] p-6 border border-[#E5DFD3] mb-8 print:bg-transparent print:border-none print:p-0">
          <h3 className="font-serif text-lg text-[#1B4D3E] mb-4">Payment Details</h3>
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <p className="font-medium text-[#1B4D3E] mb-1">Bank Transfer</p>
              <p>Bank: [Your Bank Name - MCB / SBM]</p>
              <p>Account Name: Peace and Afrova Group Ltd</p>
              <p>Account No: [To be added]</p>
              <p>SWIFT / BIC: [To be added]</p>
            </div>
            <div>
              <p className="font-medium text-[#1B4D3E] mb-1">Terms</p>
              <p>• 50% deposit required to confirm.</p>
              <p>• Balance due 60 days prior to travel.</p>
              <p>• Quote valid for 14 days.</p>
              <p className="mt-4 font-medium text-[#3D8B8B]">* This is a Proforma Invoice.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ClientBuilder() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1B4D3E]">Loading...</div>}>
      <BuilderContent />
    </Suspense>
  )
}