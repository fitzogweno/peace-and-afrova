import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/auth-admin'
import { supabaseAdmin } from '../../../lib/supabase-admin'

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { data, error } = await supabaseAdmin()
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ partners: data })
  } catch (error: any) {
    console.error('PARTNERS LIST ERROR:', error)
    return NextResponse.json({ error: 'Failed to load partners' }, { status: 500 })
  }
}
