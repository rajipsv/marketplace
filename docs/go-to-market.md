# Finding the First Customers — Go-to-Market Plan

Goal: **first 50 paying families in the USA within ~90 days of payments going live**, starting with the three founding teachers (chess, maths, dance) and growing the catalogue from what families ask for.

Who we serve: Indian-American families — mostly parents (30–45) booking for kids aged 5–15, plus adults for themselves. They live in WhatsApp groups, temple and cultural associations, school-parent networks, and Facebook/Instagram communities, and they trust word of mouth over ads.

> Who does this work: the business operator(s) in India and any helpers — see `plan.md` (company structure / H-1B note).

---

## Phase A — Before payments (now): validate demand

1. **Get the three founding teachers live**
   - Each signs up at `/teach/apply` with their own email, uploads a photo and short bio, sets weekly hours in IST (aim for US evenings 6–9 pm ET = 4:30–7:30 am IST, and US weekend mornings = Indian evenings).
   - Admin approves; remove placeholder profiles.
2. **Founding-family offer**: first class free (or $1) for the first 20 families who book — fills calendars, earns reviews.
3. **Collect demand with `/request`**: every "we don't have that yet" becomes a request in Admin → Requests. Review weekly; recruit teachers for the top 3 asked-for subjects.
4. **Warm network first (week 1–2)**
   - Personal message to 30–50 known families in the US (friends, colleagues, relatives' contacts) with the class link and the founding offer.
   - Ask each for one intro to another parent.
5. **Measure**: sign-ups, reservations, requests, which classes get clicks (add analytics in Phase 6).

## Phase B — Launch (when Razorpay is live)

| Channel | What to do | Cost |
|---|---|---|
| **WhatsApp** | Short message + poster for parent groups (school, apartment, temple, Telugu/Tamil/Kannada associations). One message per group, with permission from the admin | Free |
| **Temples & cultural associations** | Flyer with QR code on notice boards; offer a free demo class to their Sunday school / Bal Vihar families | Printing |
| **Cultural associations** (TANA, ATA, FIA, regional sanghas) | Sponsor/stall at Diwali, Sankranti, Ugadi events; QR code to a festival offer | $–$$ |
| **Facebook groups** | "Indian moms in <city>", "Desi parents <state>" — answer questions helpfully, share when relevant (follow group rules) | Free |
| **Instagram / YouTube Shorts** | 30-second clips: teacher intro, a kid's chess win, a dance step tutorial; post 3× a week | Free |
| **Referrals** | "Give a free class, get a free class" when a referred family books (build in Phase 5) | Discount |
| **Teachers' own networks** | Each teacher shares their profile link with past students' families abroad | Free |
| **Google** | Collection pages for searches like "online chess classes for kids", "Bharatanatyam online USA", "Telugu classes online" (SEO in Phase 6) | Free, slow |
| **Paid ads (later)** | Small Meta ads targeting Indian-American parents in metro areas (NJ, Bay Area, Dallas, Atlanta, Chicago, Seattle) once a class converts well | $5–20/day test |

## Phase C — Keep them (retention beats acquisition)

- **Weekly classes + monthly packages** (subscriptions in Phase 5) — kids' classes rebook every week.
- **Reminders** by email/WhatsApp 24 h and 1 h before (Phase 4).
- **Progress notes** from teachers after each class; recital/showcase videos for dance and music.
- **Reviews** after each class (Phase 5) — show them on class pages.
- **Festival calendar**: Diwali, Navratri, Sankranti specials 2–3 weeks ahead.

## Messaging

- One-liner: *"Live classes from India's best teachers — chess, maths, dance and more — at times that work for US families. First class free."*
- Proof points: real teachers (photos, qualifications), times shown in your US time zone, classes in the browser, pay in USD, cancel up to 24 h before.
- Avoid claims we can't back yet (e.g. "verified" only after admin verification; no "recorded classes" until video is live).

## Simple weekly scorecard

| Metric | Target by day 90 |
|---|---|
| Families signed up | 300 |
| Families who booked at least once | 80 |
| Paying families | 50 |
| Classes per family per month | 3+ |
| Class requests reviewed | every week |
| Teachers live | 10+ across 5 subjects |

## What the website already supports

- Sign-up, family/child profiles, booking (1-on-1 times and group seats), My Sessions with cancellation
- Request a class / request a time → Admin → Requests
- Teacher applications → Admin review → teacher dashboard (hours, classes, dates)

## Website work that helps marketing (to schedule)

- [ ] Founding offer: first-class-free / coupon codes
- [ ] Share buttons + WhatsApp share text on class and teacher pages
- [ ] Referral codes
- [ ] Analytics (PostHog) to see which channels bring bookings (UTM links per WhatsApp group / flyer)
- [ ] SEO collection pages and structured data
- [ ] Email capture for "notify me when this class opens"
