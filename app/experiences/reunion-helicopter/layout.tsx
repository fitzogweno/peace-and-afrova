import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Piton de la Fournaise Volcano Flight | Peace and Afrova',
  description: 'Fly directly into the heart of an active volcano. 25-minute private flight over the lunar landscape of Réunion Island.',
  openGraph: {
    title: 'Réunion Volcano Private Flight',
    description: 'Soar over the lunar landscape of Piton de la Fournaise and the dramatic cirques of Réunion Island.',
    images: ['https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=1200&q=80'],
    type: 'website',
  },
}

export default function ReunionHelicopterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}