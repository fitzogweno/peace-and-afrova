/** Cloudflare Turnstile check. If TURNSTILE_SECRET_KEY is not set, the check is skipped (bot protection is optional). */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const json = await res.json()
    return json?.success === true
  } catch (err) {
    console.error('Turnstile verification failed to run:', err)
    return false
  }
}
