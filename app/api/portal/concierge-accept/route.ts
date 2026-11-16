import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { getPortalUser, ownedQuotationId } from '../../../../lib/portal-auth'

export async function POST(req: Request) {
  const user = await getPortalUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { requestId } = await req.json()
  if (!requestId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const db = supabaseAdmin()
  const { data: request } = await db.from('concierge_requests').select('id, booking_ref, status').eq('id', requestId).single()
  if (!request || !(await ownedQuotationId(db, user.id, request.booking_ref))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { error } = await db.from('concierge_requests').update({ status: 'accepted' }).eq('id', requestId)
  if (error) return NextResponse.json({ error: 'Could not update the request' }, { status: 500 })
  return NextResponse.json({ success: true })
}
