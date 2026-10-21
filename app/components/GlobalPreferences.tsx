"use client"

import { useState, useRef, useEffect } from 'react'
import { Globe, X, ArrowRightLeft, Search, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Helper component for searchable currency select
function CurrencySearch({ 
  value, 
  onChange, 
  options, 
  label 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  label: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = options.filter(curr => 
    curr.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-[#1B4D3E]/30 py-2 cursor-pointer text-[#1B4D3E] font-serif text-lg"
      >
        <span>{value}</span>
        <ChevronDown size={16} className="text-[#C9A961]" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5DFD3] shadow-xl z-[200] max-h-48 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[#E5DFD3] p-2">
            <div className="flex items-center gap-2 px-2 bg-[#F5F0E6]">
              <Search size={14} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm py-1 outline-none text-[#1B4D3E]"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No currency found</div>
          ) : (
            filtered.map(curr => (
              <div 
                key={curr}
                onClick={() => { onChange(curr); setIsOpen(false); setSearch(''); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#FAF7F0] ${value === curr ? 'font-medium text-[#1B4D3E]' : 'text-gray-600'}`}
              >
                {curr}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function GlobalPreferences() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, currency, setCurrency, t, rates, availableCurrencies } = useApp()
  
  const [tempLang, setTempLang] = useState(language)
  const [tempCurr, setTempCurr] = useState(currency)
  
  const [convertAmount, setConvertAmount] = useState('1000')
  const [convertFrom, setConvertFrom] = useState('USD')
  const [convertTo, setConvertTo] = useState('MUR')

  function getConvertedAmount() {
    const amount = parseFloat(convertAmount) || 0
    const fromRate = rates[convertFrom] || 1
    const toRate = rates[convertTo] || 1
    
    const inMUR = amount / fromRate
    const result = inMUR * toRate
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: convertTo, 
      maximumFractionDigits: 2 
    }).format(result)
  }

  function handleApply() {
    setLanguage(tempLang as any)
    setCurrency(tempCurr)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => { setTempLang(language); setTempCurr(currency); setIsOpen(true); }}
        className="flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ivory hover:text-gold transition"
      >
        <Globe size={16} />
        <span className="hidden md:inline">{language} · {currency}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#F5F0E6] w-full max-w-md shadow-2xl relative flex flex-col">
            
            <div className="bg-[#1B4D3E] text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl">{t('global.preferences')}</h3>
                <p className="text-xs text-[#C9A961] uppercase tracking-widest mt-1">One website. Your language. Your currency.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-[#E5DFD3]">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-medium">{t('global.language')}</label>
                  <select 
                    value={tempLang} 
                    onChange={(e) => setTempLang(e.target.value as any)}
                    className="w-full font-serif text-lg text-[#1B4D3E] focus:outline-none bg-transparent"
                  >
                    <option value="EN">English (EN)</option>
                    <option value="FR">Français (FR)</option>
                  </select>
                </div>
                
                <div className="bg-white p-4 border border-[#E5DFD3]">
                  <CurrencySearch 
                    label={t('global.currency')}
                    value={tempCurr}
                    onChange={setTempCurr}
                    options={availableCurrencies}
                  />
                </div>
              </div>

              {/* Converter */}
              <div className="bg-white p-4 border border-[#E5DFD3]">
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">
                  <ArrowRightLeft size={14} className="text-[#C9A961]"/> {t('global.convert')}
                </div>
                
                <div className="mb-4">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Amount</label>
                  <input 
                    type="number" 
                    value={convertAmount} 
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full font-serif text-2xl border-b border-[#1B4D3E]/30 pb-1 focus:outline-none focus:border-[#C9A961] text-[#1B4D3E]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <CurrencySearch 
                    label="From"
                    value={convertFrom}
                    onChange={setConvertFrom}
                    options={availableCurrencies}
                  />
                  <CurrencySearch 
                    label="To"
                    value={convertTo}
                    onChange={setConvertTo}
                    options={availableCurrencies}
                  />
                </div>

                <div className="text-right border-t border-[#E5DFD3] pt-3">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Result:</span>
                  <div className="text-2xl font-serif text-[#C9A961]">
                    {getConvertedAmount()}
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 bg-white border-t border-[#E5DFD3]">
              <button 
                onClick={handleApply}
                className="w-full bg-[#1B4D3E] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#C9A961] hover:text-[#1B4D3E] transition"
              >
                Apply Preferences
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}