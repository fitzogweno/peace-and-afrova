/** Returns the current Turnstile token (if the gate is enabled) and asks for a fresh one, since tokens are single use. */
export function takeTurnstileToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as any
  const token = w.__turnstileToken as string | undefined
  w.__turnstileToken = undefined
  try { w.turnstile?.reset('#ts-gate') } catch {}
  return token
}
