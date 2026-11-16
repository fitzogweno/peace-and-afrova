# Peace and Afrova: code review and Phase 1 fixes

Verified: `tsc` clean and a full `next build` (Next 16.4.5, Cache Components on) generates all 80 pages.
Not verified: anything against your live Supabase, Resend or WhatsApp accounts.

## Deploy order
1. Vercel env vars: `ADMIN_EMAILS` (comma separated admin emails, required, fails closed), `SUPABASE_SERVICE_ROLE_KEY`
   (already used), `CRON_SECRET` (already used), optional `NEXT_PUBLIC_SITE_URL`, `ADMIN_WHATSAPP_NUMBER`.
2. Run `supabase/security-hardening.sql` Sections 0 and 1 (Section 3 comes later, see Phase 2) (put your admin email in Section 0).
3. Deploy the code. Log in at /admin/login, open Finance, Dispatch, Bookings.
4. Run Section 2. Leave Section 3 for Phase 2.
5. Existing drivers' old links (`/driver/job/<row id>`) stop working. Copy fresh links from the Dispatch Board.

## What was wrong and what changed
| # | Problem | Fix |
|---|---|---|
| 1 | Almost no API route checked who was calling. Anyone could read /api/finance (service role), list partners, approve partners, mark a trip Paid (/api/pay-balance), set any quote total (/api/process-counter-offer), send email from your domain, burn your AeroDataBox quota. | `lib/auth-admin.ts`: server-side admin check on every admin route. Clients are Supabase users too, so the allow-list (`ADMIN_EMAILS`) is what counts. Admin pages call `adminFetch`. |
| 2 | Login set a cookie `admin_session=true` that nothing reads and anyone can forge. | Removed. Login now verifies admin status server-side; the admin layout checks it on every page and no longer shows the sidebar on the login screen. |
| 3 | accept-quote trusted the browser's `totalAmount` and used a 50% deposit; the site, legal pages and quote builder say 30%. | Total comes from the database. One constant, `DEPOSIT_RATE = 0.30`, in `lib/pricing.ts`. Check `admin/quote/[id]/page.tsx` still prints "50% deposit" in its terms text and change it. |
| 4 | Counter-offers had no limit and no state check. | Must be Pending, positive, not above the quote, and not below 80% (`MAX_COUNTER_DISCOUNT`). |
| 5 | Service guarantee never fired on Vercel: it compared Mauritius pickup times with UTC server time. The QR scan path bypassed it, credit overwrote instead of adding, and anyone with a job id could call it. | `lib/service-guarantee.ts` uses Mauritius time and the job's travel date, applies once per job, adds to the credit. Scanning a voucher now only records that the passenger showed it. |
| 6 | Driver link was the raw row id; the dashboard trusted a forgeable `driver_session=<name>` cookie; the job page wrote to the database directly with the public key. | Per-job random `access_token`, read and write through `/api/driver/*`. Statuses only move forward. |
| 7 | Abandoned-quote cron emailed every internal Draft (including auto-estimates the client never received) every day, forever. Balance cron also emailed unpaid-deposit bookings and could repeat. | Only quotes marked Sent by send-quote, once each. Only Partially Paid bookings, once each, using Mauritius dates. |
| 8 | Booking and quote refs had 9,000 possibilities and open the client portal, which reads PII with the public key. | `lib/refs.ts`: 8 random characters. Old refs stay guessable until Phase 2. |
| 9 | Finance mixed assumptions: fixed 30% for Partially Paid, ignored service credit, chart always empty. | Uses `DEPOSIT_RATE`, nets the credit, builds the monthly chart. |
| 10 | Emails inserted raw user text into HTML. Public forms accepted any field (partner-apply spread the whole body into the insert). CV upload accepted any file type into a public bucket. | `esc()` on email templates, field whitelist, size and type checks. |
| 11 | `after()` was not used: un-awaited fetches after the response can be killed on Vercel, so driver and client emails could silently never send. A localhost fallback URL also made them fail. | supplier-booking uses `after()` and the request's own origin. |
| 12 | Build blockers behind the dispatch error: render-time `new Date()` in two quote pages, `usePathname`/`useParams` outside Suspense (admin layout, driver job, journeys), /api/weather swallowing the prerender signal. | All fixed; the build passes. |

## Phase 2 (done): portal, driver and partner access
Verified with `tsc` and a full `next build` (88 pages). Not tested against live data.
- **Client portal reads and writes now go through `/api/portal/*`** (me, quote, itinerary, hub, welcome, intake, branding, concierge-accept).
  Quote and itinerary pages use the reference as the key; dashboard, hub and welcome require a signed-in customer who owns the quote.
- **The itinerary no longer sends net rates or margins.** It used to load `quotation_items(*)` and `supplier_bookings(*)` into the
  client's browser, including `supplier_cost` and every driver's access token. It now returns only description fields, and driver
  contact details are withheld until 10 days before arrival on the server, not just hidden in the UI.
- **Account takeover closed.** Registration used to run `update customers set auth_id = me where email = X` from the browser, so anyone
  could register a client's email and claim their trips. Linking now happens on the server and only for a verified email.
  **Turn on "Confirm email" in Supabase (Authentication, Providers, Email) or this protection does nothing.**
- Logo uploads go through the server (PNG, JPG or WebP, 2 MB, random file names).
- `/driver` and `/driver/dashboard` are retired and show a "use your job link" notice.
- `supabase/security-hardening.sql` Section 3 enables RLS on every core table with an admin-only policy, public read for services and
  approved reviews, and email-matched read policies for the partner portal.

### Phase 2 deploy order
1. Supabase: turn on "Confirm email".
2. Deploy this code and test: register a new client, open a quote link, the itinerary, the hub, upload a logo, as a driver open a job link.
3. Only then run Section 3. If a page breaks afterwards, a direct browser query was missed; tell me which page.
4. Check the `(?)` column names in the partner policies against your schema before running them.

### Still open
- Quote references created before this change are 4 digits and still guessable. For quotes still open, create them again or give them
  new references; paid trips matter most because the itinerary shows hotel and flight details.
- Make the `cvs` bucket private and serve signed URLs to admin.
- Dispatch downloads every `supplier_bookings` row and filters in the browser; filter in the query.
- `quotations` has both `status` and `quote_status`; keep one.
- Vercel cron `0 8 * * *` is 08:00 UTC, which is 12:00 in Mauritius.
- Payments are still recorded by hand; a gateway webhook should replace confirm-payment and pay-balance.
- The late-pickup credit is a flat Rs 500; decide whether it should scale with the booking.

## Phase 3 (done): rate limiting, bot check, automatic flight watch
Verified with `tsc` and a full `next build` (89 pages). Not tested against AeroDataBox, WhatsApp or live data.

**Run `supabase/security-hardening.sql` Section 4 BEFORE deploying this code** (new table, function and columns).

- **Rate limiting** in Postgres (no extra service): enquiry 5/hour, reviews 3/hour, partner and careers applications 3/hour,
  concierge and amendment requests 10/hour, accept-quote 20/hour, per IP. Wrong portal references are counted separately
  (15 misses per hour per IP, then blocked), which makes guessing old 4-digit references impractical. Fails open if the database call fails.
- **Cloudflare Turnstile** (free) is optional. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel to enable it on
  the enquiry, review and partner forms; with no keys the check is skipped. It is invisible unless a visitor looks suspicious.
- **Flight watch (the live re-planning engine)**: `lib/flight-watch.ts` and `/api/cron/flight-watch`.
  Every 30 minutes it looks only at arrivals today or tomorrow, only inside the window 8 hours before to 4 hours after the scheduled landing,
  stops once the flight has landed, and costs about 10 to 16 API calls per arriving flight. For each arrival it measures the delay against the
  ORIGINAL schedule, moves the arrival pickup by that delay (rounded to 5 minutes), messages the driver (WhatsApp and email independently, with the
  job link), emails the client when the delay is 30 minutes or more, alerts you if the flight is cancelled or diverted, and logs every decision in `flight_events`.
  The old tracker only compared against the previous check, so a delay that grew in 20-minute steps never triggered, and it used the server's clock
  and today's date for the pickup time.
- **Scheduler**: Vercel Hobby crons run once a day, so `.github/workflows/flight-watch.yml` calls the endpoint every 30 minutes for free.
  Add repository secrets `SITE_URL` and `CRON_SECRET`. GitHub may delay scheduled runs by several minutes and pauses them on a public repository
  after 60 days without activity. The Check Flight button on the bookings page still works for a manual check.
- **Driver scorecard fixed**: it counted `delay_minutes`, which is the FLIGHT delay, as the driver being late, so a delayed plane marked your driver down.
  It now uses a new `driver_minutes_late` (set when the driver presses Picked Up). Earlier history will show no late jobs.

New environment variables: `ADMIN_ALERT_EMAIL` (optional), `ADMIN_WHATSAPP_NUMBER` (optional), `TURNSTILE_*` (optional), plus the
existing `AERODATABOX_API_KEY`.

Known limits to decide on:
- **WhatsApp**: Meta only delivers free-text messages to people who messaged you in the last 24 hours. Delay alerts to drivers and to you need
  approved message templates, so until those exist rely on the email path. Tell me your template names and I will switch it over.
- Only the arrival transfer is moved (a job whose description contains "arriv", or the only job on the booking). Departure pickups still use the manual Calculate Departure button.
- Flights that land early are not pulled forward; delays never go below zero.
- A pickup pushed past midnight keeps its time-of-day and is flagged "(next day)" in the message; the dispatch board still lists it under the original date.
- Check that `enquiries.estimated_arrival` and `actual_arrival` are timestamp columns (query in Section 4).

## Phase 4 (done): the partner request, quotation and accept loop
`/api/requests/accept-quote` did not exist, and the partner's "Submit Quotation" button did nothing, so the whole loop was dead.
Verified with `tsc` and a full `next build` (92 pages). Not tested against your live schema.

**Run `supabase/security-hardening.sql` Section 5 BEFORE deploying.** It first checks that the columns the code relies on exist and stops
with a readable message listing what is missing and what the real columns are, so a schema mismatch fails loudly, not silently.

The flow now:
1. **Admin > Requests > Partner Requests.** Tick one partner, or several. With several it becomes a competitive request (`rfq_group`).
   Optionally attach it to a confirmed client trip: the date is filled in and the accepted job later shows the client's flights and hotel on dispatch.
   Each partner is emailed (and WhatsApped when configured) a link to their portal. Each partner shows their real on-time rate from past jobs.
2. **Partner portal > Requests.** Submit Quotation now works: net price, currency, inclusions, optional validity. A partner can revise until accepted.
   Admin is alerted by email or WhatsApp.
3. **Admin accepts a quote.** One database transaction (`accept_partner_quote`) creates the job on the Dispatch Board, marks the quote accepted,
   declines the other quotes, and closes the competing requests. A second click returns the same job. The winner is told; the others get a polite "not selected".
   The page only sends two ids; price, partner and dates are read from the database, not from the browser.
4. Comparison on the admin list: "Best price of N quotes" or "+X% vs best" across competing requests of the same currency.
5. Jobs with no client trip appear on the dispatch board under their service date and partner name.

Open points for you:
- The accepted partner net price is stored on the job (`cost_amount`, `cost_currency`) but Finance still computes cost from the quote lines. Decide whether the
  partner price should replace the line cost for linked trips.
- The partner has no screen yet to enter the driver and vehicle for an accepted job; for now assign it from the Dispatch Board.
- Competing quotes in different currencies are not compared (no price conversion), by design.
