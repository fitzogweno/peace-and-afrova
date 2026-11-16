import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser, ownedQuotationId } from '../../../../lib/portal-auth'

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }

export async function POST(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const db = supabaseAdmin()
  const quotationId = await ownedQuotationId(db, user.id, String(form.get('ref') || ''))
  if (!quotationId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: booking } = await db.from('bookings').select('id, client_logo_url').eq('quotation_id', quotationId).single()
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  let logoUrl = booking.client_logo_url
  const file = form.get('logo')
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!TYPES[ext] || file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Logo must be a PNG, JPG or WebP under 2 MB.' }, { status: 400 })
    }
    const path = `${booking.id}-${randomUUID()}.${ext}`
    const { error: upErr } = await db.storage.from('client-logos').upload(path, file, { contentType: TYPES[ext] })
    if (upErr) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    logoUrl = db.storage.from('client-logos').getPublicUrl(path).data.publicUrl
  }

  const { error } = await db.from('bookings').update({
    client_logo_url: logoUrl,
    client_brand_name: String(form.get('brandName') || '').slice(0, 120),
    client_welcome_message: String(form.get('welcomeMsg') || '').slice(0, 1000),
    branding_status: 'pending_approval',
  }).eq('id', booking.id)
  if (error) return NextResponse.json({ error: 'Could not save branding' }, { status: 500 })
  return NextResponse.json({ success: true, logoUrl })
}
