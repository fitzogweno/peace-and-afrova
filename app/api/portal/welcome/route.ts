import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser, ownedQuotationId } from '../../../../lib/portal-auth'

export async function GET(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ref = (new URL(req.url).searchParams.get('ref') || '').trim()

  const db = supabaseAdmin()
  const quotationId = await ownedQuotationId(db, user.id, ref)
  if (!quotationId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await db
    .from('quotations')
    .select('enquiries (destination), bookings ( client_logo_url, client_brand_name, client_welcome_message, branding_status )')
    .eq('id', quotationId).single()
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
