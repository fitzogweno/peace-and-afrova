"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../locales/translations'

type Language = 'EN' | 'FR'
type Currency = string

interface AppContextType {
  language: Language
  setLanguage: (lang: Language) => void
  currency: Currency
  setCurrency: (curr: Currency) => void
  formatPrice: (amountInMUR: number) => string
  t: (key: string) => string
  rates: Record<string, number>
  availableCurrencies: string[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN')
  const [currency, setCurrency] = useState<Currency>('MUR')
  const [rates, setRates] = useState<Record<string, number>>({ MUR: 1 })
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['MUR'])

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language
    const savedCurr = localStorage.getItem('curr')
    
    if (savedLang) setLanguage(savedLang)
    if (savedCurr) setCurrency(savedCurr)
  }, [])

  useEffect(() => {
    async function fetchRates() {
      try {
        // Using a highly reliable free API
        const res = await fetch('https://open.er-api.com/v6/latest/MUR')
        const data = await res.json()
        
        if (data.result === 'success' && data.rates) {
          // data.rates contains { USD: 0.022, EUR: 0.020, KES: 2.6 ... }
          setRates(data.rates)
          
          // Get all currency codes and add MUR
          const allCurrencies = Object.keys(data.rates).sort()
          if (!allCurrencies.includes('MUR')) allCurrencies.unshift('MUR')
          
          setAvailableCurrencies(allCurrencies)
        }
      } catch (err) {
        console.error("Failed to fetch live rates. Using fallback.", err)
        // Fallback if API fails completely
        setRates({ MUR: 1, USD: 0.022, EUR: 0.020, GBP: 0.017, KES: 2.8 })
        setAvailableCurrencies(['MUR', 'USD', 'EUR', 'GBP', 'KES'])
      }
    }
    fetchRates()
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const changeCurrency = (curr: Currency) => {
    setCurrency(curr)
    localStorage.setItem('curr', curr)
  }

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key
  }

  const formatPrice = (amountInMUR: number) => {
    if (currency === 'MUR') return `Rs ${amountInMUR.toLocaleString()}`
    
    const rate = rates[currency] || 1
    const converted = amountInMUR * rate
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted)
  }

  return (
    <AppContext.Provider value={{ 
      language, setLanguage: changeLanguage, 
      currency, setCurrency: changeCurrency,
      formatPrice, t, rates, availableCurrencies
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}