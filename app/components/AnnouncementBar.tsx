"use client"

export default function AnnouncementBar() {
  const messages = [
    "Special Offer: Book a private catamaran before October 31st and receive a complimentary spa session.",
    "New Route Added: We now offer private transfers from SSR Airport to Le Morne.",
    "Travel Partners: Register your DMC or hotel today to collaborate with us."
  ]

  return (
    <div className="bg-[#C9A961] text-[#1B4D3E] py-2.5 text-xs tracking-widest uppercase overflow-hidden relative z-50 font-medium">
      <div className="animate-marquee whitespace-nowrap flex gap-12">
        {/* We duplicate the messages to make the scroll seamless */}
        {messages.concat(messages).map((msg, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#F5F0E6] rounded-full inline-block"></span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}