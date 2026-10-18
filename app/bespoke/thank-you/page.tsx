import Link from 'next/link'
export default function ThankYou() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <h1 className="text-4xl font-serif text-emerald-900 mb-4">Thank you</h1>
        <p className="text-gray-600 mb-8">Your enquiry has been received.</p>
        <Link href="/" className="text-emerald-700 underline">Return home</Link>
      </div>
    </main>
  )
}