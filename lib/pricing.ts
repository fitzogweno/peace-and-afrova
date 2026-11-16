/** Single source of truth for commercial rules. Change here, not in individual routes or pages. */
export const DEPOSIT_RATE = 0.30          // matches website, legal pages and quote builder
export const BALANCE_DUE_DAYS = 7
export const MAX_COUNTER_DISCOUNT = 0.20  // counter-offers may not go below 80% of the quoted total
export const LATE_GRACE_MINUTES = 10
export const LATE_CREDIT_AMOUNT = 500     // MUR. All stored quote amounts are MUR; currency/exchange_rate are display-only
export const MAURITIUS_UTC_OFFSET = '+04:00' // Mauritius has no daylight saving

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
