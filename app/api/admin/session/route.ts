import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth-admin'

// Lets the admin UI ask "is this signed-in user actually an admin?" (clients are Supabase Auth users too).
export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  return NextResponse.json({ email: auth.email })
}
