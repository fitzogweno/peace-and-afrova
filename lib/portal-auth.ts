import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type PortalUser = { id: string; email: string; confirmed: boolean }

/** Verifies the customer's Supabase access token (Authorization: Bearer ...). */
export async function getPortalUser(req: Request): Promise<PortalUser | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user?.email) return null
  return { id: data.user.id, email: data.user.email.toLowerCase(), confirmed: !!data.user.email_confirmed_at }
}

/** Returns the quotation id only if this signed-in customer owns the quote with that reference. */
export async function ownedQuotationId(db: SupabaseClient, userId: string, ref: string): Promise<string | null> {
  if (!ref) return null
  const { data } = await db
    .from('quotations')
    .select('id, enquiries!inner ( customers!inner ( auth_id ) )')
    .eq('booking_ref', ref)
    .eq('enquiries.customers.auth_id', userId)
    .maybeSingle()
  return data?.id ?? null
}

export const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined)
