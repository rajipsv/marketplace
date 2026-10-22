# GuruBridge — Implementation Plan

Marketplace connecting the **Indian diaspora in the USA** (customers, free to join) with **trainers and coaches in India** (skills, academics, arts, fitness — not spiritual services). Live 1-on-1 and group classes across all categories, scheduled for US time zones.

Live: https://marketplace-ten-virid.vercel.app · Repo: https://github.com/rajipsv/marketplace

_Last updated: 2026-10-22_

---

## Decisions

| Area | Choice |
|---|---|
| Company | India-registered; platform is merchant of record (INR in, INR payouts out) |
| Customers | Indian diaspora in the USA only; free signup |
| Categories | Academics, Chess & Coding · Music, Dance & Arts · Fitness, Yoga & Sports (incl. meditation) · Languages & Career Coaching. No astrology, puja or Ayurveda (decided 2026-10-19) |
| Brand | **GuruBridge — placeholder**, change in `src/config/site.ts` |
| Stack | Next.js 15 (App Router, TS) · Tailwind v4 · Vercel |
| Database | Neon Postgres + Drizzle ORM (migrations in `drizzle/`) |
| Auth | Better Auth (email/password; Google when keys set) |
| Storage | Cloudflare R2 bucket `gurubridge-media` (presigned uploads) |
| Payments (planned) | **Prices and charges in INR** (decided 2026-10-19) via Razorpay with international cards enabled; RazorpayX payouts (INR). Confirm GST export treatment of INR-invoiced foreign payments with the CA |
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
- [x] Home page: search hero, trust strip, categories, kids spotlight, upcoming sessions (viewer time zone + IST), teachers, how it works, teach CTA
- [x] Neon database: 17-table schema, initial migration, idempotent seed (`npm run db:seed`)
- [x] Fictional sample teachers removed; catalogue = 3 real founding teachers
- [x] Owner admin account (gen.rajeswari@gmail.com); auth trusts all of this project's Vercel URLs
- [x] Home page + footer read from the database (60 s revalidate)
- [x] Better Auth: sign-up, sign-in, account page, header session state; role not user-settable
- [x] Cloudflare R2: presigned upload API (`/api/uploads`) with type/size limits; CORS for the Vercel URL; verified
- [x] Vercel deployment (framework pinned in `vercel.json`); live sign-up verified
- [x] Usage guard (90%) and 10-minute auto-commit configured

## ⏳ Waiting on owner

- [ ] **Fill business details** in `src/config/site.ts → legal` (name, operator, address, email, phone, jurisdiction) — must match GST/bank/KYC; then have a lawyer/CA review the legal pages
- [ ] Confirm promo funding in Admin → Settings (default: platform funds FIRSTCLASS, coach earns on full price) and TDS rate/basis with the CA (default 0.1% of amount paid)
- [ ] Add `CRON_SECRET` (any long random string) in Vercel env so the daily settlement cron can run
- [ ] Review the Coach agreement terms (12-month non-circumvention, 30-day notice for commission changes)
- [ ] Before payments go live: confirmation emails (policies promise them) — Resend

- [ ] **Company structure:** Indian Pvt Ltd with parents as directors (one resident director) who operate the business; confirm owner's permitted role with an immigration attorney (H-1B) and US/Indian tax filings with a cross-border CA
- [ ] Parents sign up on the site with their own emails → `npm run make-admin -- <email>`; decide whether to keep or downgrade the current admin account
- [ ] Razorpay / RazorpayX / bank in the company's name, operated by parents
- [ ] Over time, move Vercel, Neon, Cloudflare, GitHub and domain to company/parent-owned accounts

- [ ] **Founding teachers — confirm details:** Sharan (chess, ₹899, Hyderabad), Bhramaramba (maths, ₹449), Sai (dance, ₹899). Needed: city (Bhramaramba, Sai), teaching languages, 1-on-1 or group, class length, kids/adults, short bio, years of experience, photo. Currently defaulted to 1-on-1 · 60 min · English; no bios; not marked verified.

- [ ] Replace `BETTER_AUTH_SECRET` in Vercel (current one was shared in chat) and redeploy
- [ ] Final brand name + domain (then update `siteConfig`, Vercel domain, R2 CORS, `BETTER_AUTH_URL`)
- [ ] Neon dev branch so testing doesn't touch live data
- [ ] Google OAuth keys (optional)
- [ ] Razorpay International approval · RazorpayX activation
- [ ] 100ms, Resend (+ verified sending domain), Gupshup / WhatsApp Business approval
- [ ] CA: GST LUT for export of services, TDS setup · Lawyer: terms, privacy, coach agreement

---

## 🔨 Pending — build order

### Phase 2 — Browse ✅ (festival collections deferred until festival classes exist)
- [x] Explore page `/explore`: search + filters (category, for me / my child / family, language, format, price), URL-driven
- [x] Session detail `/sessions/[slug]`: info strip, about, what's included, upcoming dates (viewer time zone + IST), teacher card, FAQ, booking card + mobile sticky bar ("opening soon" until Phase 4)
- [x] Coach profile `/coaches/[slug]` and directory `/coaches` (category + language filters)
- [x] Category pages via `/explore?category=`
- [x] 404 page, page metadata, mobile header navigation
- [ ] Festival collections (when festival classes are listed)

### Phase 3 — Teacher supply ✅
- [x] `/teach` landing + `/teach/apply` application (profile, categories, languages, photo, intro video, up to 3 credentials with private documents → R2)
- [x] Admin `/admin`: overview, teacher queue by status, review page (private documents via 10-minute signed links), approve / reject / suspend, Verified badge, per-credential verification
- [x] Teacher dashboard `/coach`: setup checklist, profile edit, weekly hours (IST), classes (1-on-1 / group / weekly), session dates with weekly repeat + overlap check, cancel
- [x] Role-based protection on pages and server actions; `/media` serves public photos via signed redirects (bucket stays private)
- [x] `npm run make-admin -- <email>`
- [x] Verified end-to-end on the live site with a real browser (19 checks), test data removed
- [ ] Founding teachers (Sharan, Bhramaramba, Sai) to sign up with their own email and apply; then approve them and retire the placeholder profiles
- [ ] Email notifications for application received / approved (needs Resend — Phase 4)

### Phase 4a — Customer side (no payment) ✅
- [x] Family profiles `/account/family` (parent adds children)
- [x] Booking `/book/[slug]`: who attends; 1-on-1 slot picker from weekly hours (viewer time zone + IST, 12 h notice, 21-day window); group/weekly dates with seats left
- [x] No double-booking (row locks per teacher / per session); free classes confirm, paid ones are "reserved" until payments go live
- [x] My Sessions `/my-sessions`: upcoming / past, cancel up to 24 h before
- [x] Teacher Bookings + Admin Bookings views
- [x] Demand capture: `/request` (request a time / a class) → Admin → Requests
- [x] Go-to-market plan: `docs/go-to-market.md`
- [x] Offer codes: admin-managed coupons (percent off, usage limit, first-booking-only, expiry), applied safely inside the booking; `?code=` links; founding offer **FIRSTCLASS** (first class free, 20 families, until 14 Jan 2027) promoted on home + class pages
- [x] Share buttons (WhatsApp, copy link, native share) on class and teacher pages
- [x] Legal pages: terms, privacy, cancellation & refunds, service delivery, disclaimer, contact, about (footer links; no dead links)
- [x] Repositioned as trainers & coaches: 4 categories, spiritual content removed (meditation kept under Fitness & Yoga), brand-initial logo; migration 0005
- [x] Coach agreement `/coach-agreement` (commission, payouts, conduct, child safety, non-circumvention); required checkbox on application, acceptance time stored and shown to admin
- [x] SEO: sitemap, robots, link-preview image, page metadata + canonical URLs, structured data (Organization/WebSite search, Course + FAQ, Person)
- [x] Installable app (PWA): manifest, icons (`scripts/generate-icons.py <letter>`), offline page, service worker, "Install the app" button
- [x] Earnings ledger: daily settlement (Vercel Cron + admin button) completes sessions, records coach share per completed booking, refund hold → payable; Admin → Payouts (pay list with TDS, mark paid, hold, history, platform revenue); Admin → Settings (commission, TDS, hold days, promo basis); Coach → Earnings
- [x] Currency switched to INR everywhere (prices, filters, coupons, forms, policies); founding prices ₹899 chess / ₹449 maths / ₹899 dance; migrations 0003–0004

### Phase 4b — Payments & live classes
- [ ] Checkout: Razorpay INR orders (international cards), webhook (signature, idempotency), PayPal option
- [ ] Free trial flow for kids' classes
- [ ] My Sessions: join link, reschedule, receipts
- [ ] 100ms video rooms, join tokens, recording (always for kids' classes)
- [ ] Emails (Resend): verification, password reset, booking confirmation + calendar invite, 24 h / 1 h reminders
- [ ] Background jobs (Inngest / Vercel Cron): reminders, session completion, no-shows

### Phase 5 — Money out, reviews, legal
- [ ] Subscriptions for weekly classes
- [ ] RazorpayX automatic payouts + coach bank/UPI/PAN capture (ledger, TDS, manual payout reports and coach earnings ✅ done)
- [ ] Reviews (verified bookings only), ratings on cards and profiles, favourites
- [ ] Gift sessions (offer codes ✅ done in Phase 4a)
- [ ] WhatsApp reminders
- [ ] Child safety: parental consent, no direct coach↔child messaging, recordings
- [ ] In-app messaging (contact details hidden), report / block
- [ ] Admin: refunds, disputes, review moderation, reports (bookings, requests, offer codes ✅ done)

### Phase 6 — Production hardening
- [ ] Tests: Vitest (unit), Playwright (booking + payment E2E) against Vercel previews
- [ ] CI: GitHub Actions (lint, typecheck, test, build)
- [ ] Monitoring: Sentry, structured logs, uptime checks
- [ ] Security: rate limiting, Turnstile on forms, security headers, `npm audit` fixes, least-privilege DB role
- [ ] Accessibility audit (WCAG 2.2 AA) and performance (images, Core Web Vitals)
- [ ] Analytics (PostHog) + cookie consent
- [ ] Backups, staging environment (Neon branch + Vercel preview)
- [ ] Real coach photos and content; remove seed data from production

### Mobile
- [x] Responsive web (phone-first layouts, mobile nav, sticky booking bar)
- [x] PWA: installable app, icons, offline page
- [ ] Web push reminders

### Mobile app (Expo / React Native) — build after payments + video are live on the web
**Approach:** one repo with `apps/web` (this Next.js site), `apps/mobile` (Expo, iOS + Android) and `packages/shared` (types, validation, time/slot helpers, pricing). The app uses the same backend: Neon, Better Auth (Expo plugin, bearer tokens), R2, Razorpay, 100ms. Admin stays on the website.

Groundwork ✅ (done now, also used by the website):
- [x] Booking, coupon, family and class-request rules moved to shared services (`src/server/services`); website actions are thin wrappers
- [x] JSON API `/api/v1` (catalogue, availability, me, family, bookings, cancel, coupon preview, requests) — see `docs/api.md`
- [x] Better Auth bearer tokens for the app (`Authorization: Bearer …`)

Build (~6–8 weeks once started):
- [ ] Week 1: monorepo (Turborepo + pnpm) with `apps/web`, `apps/mobile`, `packages/shared`; Vercel root directory → `apps/web`; Expo sign-in with `@better-auth/expo`
- [ ] Weeks 2–4: customer screens — Explore, class page, booking (slot picker in device time zone + IST), My Sessions, family, account
- [ ] Weeks 5–6: Razorpay React Native checkout, 100ms React Native classroom, Expo push reminders (24 h / 1 h)
- [ ] Weeks 7–8: TestFlight + Play internal testing, store listings (privacy policy, data safety), review
- [ ] Later: coach features in the app (bookings, hours, earnings)
- [ ] Optional quick win: Android Play Store listing of the website (Trusted Web Activity)

Owner prerequisites:
- [ ] Apple Developer ($99/yr) + Google Play ($25 once) in the business's name; D-U-N-S number for Apple (free, 1–2 weeks)
- [ ] Payments: live 1-to-1 services can use Razorpay under App Review guideline 3.1.3(d); confirm group-class treatment at submission

### Later
- [ ] Free practice video library (SEO + trust)
- [ ] Referral program, corporate wellness
