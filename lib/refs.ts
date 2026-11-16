import { randomInt } from 'crypto'

// No 0/O/1/I/L so references can be read out over the phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Unguessable reference, e.g. PA-2026-K7M2X9QD (about 1e11 combinations vs 9,000 before). */
export function makeRef(prefix: string, length = 8) {
  let code = ''
  for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return `${prefix}-${new Date().getFullYear()}-${code}`
}
