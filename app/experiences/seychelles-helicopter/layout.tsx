import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seychelles Island Hopping Scenic Flight | Peace and Afrova',
  description: '90-minute private scenic flight over Mahé, Praslin, and La Digue in a premium Airbus H-120. The ultimate aerial view of the Seychelles archipelago.',
  openGraph: {
    title: 'Seychelles Island Hopping Scenic Flight',
    description: 'Experience the ultimate luxury aerial view of Mahé, Praslin, and La Digue.',
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80'],
    type: 'website',
  },
}

export default function SeychellesHelicopterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}