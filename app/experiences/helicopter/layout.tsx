import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Underwater Waterfall Helicopter Tour | Peace and Afrova',
  description: 'Experience the world-famous optical illusion of the underwater waterfall from the skies. 45-minute scenic flight over Le Morne, Chamarel, and the Black River Gorges.',
  openGraph: {
    title: 'The Underwater Waterfall Helicopter Tour',
    description: 'Book a premium 45-minute helicopter flight over Le Morne and the Black River Gorges in a luxury Airbus H130.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'],
    type: 'website',
  },
}

export default function MauritiusHelicopterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}