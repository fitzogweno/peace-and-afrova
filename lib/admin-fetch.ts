import { supabase } from '../app/utils/supabase'

/** fetch() for signed-in pages (admin and client portal): attaches the signed-in admin's access token so API routes can verify it. */
export async function adminFetch(input: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  if (typeof init.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(input, { ...init, headers })
}
