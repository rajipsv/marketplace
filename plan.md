# GuruBridge — Implementation Plan

Marketplace connecting the **Indian diaspora in the USA** (customers, free to join) with **teachers, coaches and gurus in India**. Live 1-on-1 and group classes across all categories, scheduled for US time zones.

Live: https://marketplace-ten-virid.vercel.app · Repo: https://github.com/rajipsv/marketplace

_Last updated: 2026-10-16_

---

## Decisions

| Area | Choice |
|---|---|
| Company | India-registered; platform is merchant of record (USD in, INR payouts out) |
| Customers | Indian diaspora in the USA only; free signup |
| Categories | All: kids & culture, spiritual & astrology, puja, yoga & fitness, health & nutrition, mind & relationships, career & learning |
| Brand | **GuruBridge — placeholder**, change in `src/config/site.ts` |
| Stack | Next.js 15 (App Router, TS) · Tailwind v4 · Vercel |
| Database | Neon Postgres + Drizzle ORM (migrations in `drizzle/`) |
| Auth | Better Auth (email/password; Google when keys set) |
| Storage | Cloudflare R2 bucket `gurubridge-media` (presigned uploads) |
| Payments (planned) | Razorpay International (USD) + PayPal; RazorpayX payouts (INR) |
| Video (planned) | 100ms |
| Email / WhatsApp (planned) | Resend · Gupshup |
| Workflow | No localhost — push to `main`, Vercel deploys, test on live URL |

## Working rules

- Auto-commit + push every 10 minutes (Windows task `MarketplaceAutoCommit`, `scripts/auto-commit.ps1`).
- Claude stops implementation at 90% of 5-hour or weekly usage (`~/.claude/hooks/usage-guard.js`).
- Before every push: `npm run typecheck`, `npm run lint`, `npm run build`.
- Test data created on the live database is deleted after each check.

---

## ✅ Done

- [x] Market research: SoulSensei design teardown + page walkthrough (`docs/research/`)
- [x] Next.js scaffold, design tokens (saffron / peacock / ivory, light + dark), Fraunces + Inter
- [x] Home page: search hero, trust strip, categories, kids spotlight, upcoming sessions (viewer time zone + IST), festivals, teachers, how it works, languages, teach CTA
- [x] Neon database: 17-table schema, initial migration, idempotent seed (`npm run db:seed`)
- [x] Home page + footer read from the database (60 s revalidate)
- [x] Better Auth: sign-up, sign-in, account page, header session state; role not user-settable
- [x] Cloudflare R2: presigned upload API (`/api/uploads`) with type/size limits; CORS for the Vercel URL; verified
- [x] Vercel deployment (framework pinned in `vercel.json`); live sign-up verified
- [x] Usage guard (90%) and 10-minute auto-commit configured

## ⏳ Waiting on owner

- [ ] Replace `BETTER_AUTH_SECRET` in Vercel (current one was shared in chat) and redeploy
- [ ] Final brand name + domain (then update `siteConfig`, Vercel domain, R2 CORS, `BETTER_AUTH_URL`)
- [ ] Neon dev branch so testing doesn't touch live data
- [ ] Google OAuth keys (optional)
- [ ] Razorpay International approval · RazorpayX activation
- [ ] 100ms, Resend (+ verified sending domain), Gupshup / WhatsApp Business approval
- [ ] CA: GST LUT for export of services, TDS setup · Lawyer: terms, privacy, coach agreement

---

## 🔨 Pending — build order

### Phase 2 — Browse (no new keys needed) ← **in progress**
- [ ] Explore page `/explore`: filters (category, for me / my child / family, language, format, price), search, URL-driven
- [ ] Session detail `/sessions/[slug]`: hero, info strip (duration · format · languages), what's included, upcoming dates in viewer time zone + IST, coach card, FAQ, sticky price/booking bar
- [ ] Coach profile `/coaches/[slug]`: bio, credentials, languages, experience, offerings, upcoming sessions
- [ ] Coaches directory `/coaches`
- [ ] Category pages (via `/explore?category=`) and festival collections
- [ ] 404 / error pages, page metadata

### Phase 3 — Teacher supply
- [ ] "Teach with us" landing `/teach` + application form (profile, categories, languages, photo, intro video, credential documents → R2)
- [ ] Admin: coach review queue (view private documents via signed links), approve / reject
- [ ] Coach dashboard: profile edit, weekly availability (IST), exceptions, create/edit offerings and prices
- [ ] Role-based route protection (customer / coach / admin)

### Phase 4 — Booking & payments
- [ ] Family profiles (parent adds children)
- [ ] 1-on-1 slot picker (availability → slots in viewer time zone, buffers, no double-booking)
- [ ] Group / weekly class booking with capacity checks
- [ ] Checkout: Razorpay USD orders, webhook (signature, idempotency), PayPal option
- [ ] Free trial flow for kids' classes
- [ ] My Sessions: upcoming / past, join, cancel / reschedule with policy, receipts
- [ ] 100ms video rooms, join tokens, recording (always for kids' classes)
- [ ] Emails (Resend): verification, password reset, booking confirmation + calendar invite, 24 h / 1 h reminders
- [ ] Background jobs (Inngest / Vercel Cron): reminders, session completion, no-shows

### Phase 5 — Money out, reviews, legal
- [ ] Subscriptions for weekly classes
- [ ] RazorpayX payouts to coaches in INR, TDS, commission ledger, reconciliation, coach earnings page
- [ ] Reviews (verified bookings only), ratings on cards and profiles, favourites
- [ ] Coupons, gift sessions
- [ ] WhatsApp reminders
- [ ] Legal pages: terms, privacy (CCPA + DPDP), refunds, disclaimer, coach agreement
- [ ] Child safety: parental consent, no direct coach↔child messaging, recordings
- [ ] In-app messaging (contact details hidden), report / block
- [ ] Admin: bookings, refunds, disputes, review moderation, collections, coupons, reports

### Phase 6 — Production hardening
- [ ] Tests: Vitest (unit), Playwright (booking + payment E2E) against Vercel previews
- [ ] CI: GitHub Actions (lint, typecheck, test, build)
- [ ] Monitoring: Sentry, structured logs, uptime checks
- [ ] Security: rate limiting, Turnstile on forms, security headers, `npm audit` fixes, least-privilege DB role
- [ ] Accessibility audit (WCAG 2.2 AA) and performance (images, Core Web Vitals)
- [ ] SEO: metadata, sitemap, robots, JSON-LD (Person, Event, FAQ)
- [ ] Analytics (PostHog) + cookie consent
- [ ] Backups, staging environment (Neon branch + Vercel preview)
- [ ] Real coach photos and content; remove seed data from production

### Later
- [ ] Free practice video library (SEO + trust)
- [ ] Referral program, corporate wellness, mobile app (Expo)
