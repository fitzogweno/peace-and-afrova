"use client"

import { useApp } from '../context/AppContext'

export default function GlobalToggle() {
  const { language, setLanguage, currency, setCurrency } = useApp()

  return (
    <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-[#C9A961] font-medium">
      {/* Language Toggle */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLanguage('EN')} 
          className={`transition ${language === 'EN' ? 'text-white' : 'opacity-50 hover:opacity-100'}`}
        >
          EN
        </button>
        <span className="opacity-30">|</span>
        <button 
          onClick={() => setLanguage('FR')} 
          className={`transition ${language === 'FR' ? 'text-white' : 'opacity-50 hover:opacity-100'}`}
        >
          FR
        </button>
      </div>

      <span className="opacity-30">|</span>

      {/* Currency Toggle */}
      <div className="flex items-center gap-2">
        {['MUR', 'USD', 'EUR'].map((curr) => (
          <button 
            key={curr}
            onClick={() => setCurrency(curr as any)} 
            className={`transition ${currency === curr ? 'text-white' : 'opacity-50 hover:opacity-100'}`}
          >
            {curr}
          </button>
        ))}
      </div>
    </div>
  )
}