import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse }

/**
 * Server-side admin gate for API routes.
 * Clients are ALSO Supabase Auth users (portal login), so a valid session is not enough:
 * the email must be listed in the ADMIN_EMAILS env var (comma separated). Fails closed.
 */
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase.auth.getUser(token)
  const email = data?.user?.email?.toLowerCase()
  if (error || !email) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!allowed.includes(email)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, email }
}

/** Accepts either an admin session or the Vercel cron secret (for jobs that cron and admins both trigger). */
export async function requireAdminOrCron(req: Request): Promise<AdminCheck> {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') === `Bearer ${secret}`) {
    return { ok: true, email: 'cron' }
  }
  return requireAdmin(req)
}
