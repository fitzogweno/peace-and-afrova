"use client"

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const phoneNumber = "23057400125" // Your WhatsApp number without the +
  const message = encodeURIComponent("Hello Peace and Afrova, I am interested in a bespoke trip to Mauritius.")
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 flex items-center justify-center group print:hidden"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  )
}