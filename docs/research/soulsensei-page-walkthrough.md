# SoulSensei — Public Page Walkthrough

Captured 2026-10-15 without logging in. Screenshots: [screenshots/](screenshots/).
Logged-in areas (My Sessions, slot picker, checkout, payment) were **not** tested — `/checkout` shows only "No item in the cart".

---

## Site map (observed URLs)

| URL pattern | Page |
|---|---|
| `/` | Marketing home |
| `/about-us` | About + guide grid |
| `/live` | All Workshops (master listing: group + 1-on-1 mixed) |
| `/live/personal` | 1-on-1 Guidance listing |
| `/live/personal/category/{mind-and-emotions,relationships,health,career,wealth,soul-and-purpose}` | 1-on-1 by concern |
| `/live/workshop/collection/{slug}` | Themed collection (~90, e.g. `calm-anxiety`) |
| `/live/offline/collection/offline-sessions` | In-person events |
| `/live/leader/{slug}` | Guide profile |
| `/leader/{slug}/one-on-one/{offering-slug}?id=N` | 1-on-1 offering detail |
| `/courses` | "SoulSessions" — group workshops with filters |
| `/one-on-one/listing` | Personal Sessions listing |
| `/media/all` | "Practice" — free short videos library |
| `/checkout` | Cart / checkout (login required) |
| `/contact-us`, cancellation, privacy, terms | Static |

---

## 1. Home `/` ([screenshot](screenshots/home.jpg))

Order of sections:
1. **Header** — logo, "My Sessions".
2. **Hero** — "Spiritual Guidance For Every Chapter of Life" / "LIVE Workshops & 1-on-1 Video Calls with India's Most Trusted Spiritual Guides" / coral **Explore Workshops** pill. Phone mockup of a LIVE workshop (guide name, rating 4.9, LIVE NOW) between two auto-scrolling rows of guide portraits labelled by role.
3. **Stats strip** — 300+ Trusted Guides · 100+ Spiritual Practices · 1,00,000+ Seekers.
4. **Concern grid (3×3)** + copy "LIVE & Guided Workshops for Every Need" — Calm Your Mind, Heal Emotionally, Manifest Wealth, Heal Relations, Age Gracefully, Find Your Purpose…
5. **Learn From 300+ Trusted Guides** — horizontal guide-card carousel.
6. **Ancient Wisdom for the Modern Life** — practice tiles (Tarot, Astrology, Akashic Records, Numerology, Angel Guidance, Psychic Reading).
7. **Your Healing, Your Way** — format carousel (rendered empty in capture).
8. **Trust** — 4.7★ average rating badge, "Trusted by 50,000+ Seekers", two marquee rows of testimonials.
9. **Download The App** — QR + store badges + "Continue To Web".
10. **Footer** — stats, app card, links, address, socials, ~90 "Popular Links", SEO accordion.

## 2. All Workshops `/live` ([screenshot](screenshots/all-workshops.jpg))

- Full app header (Categories ▾, Our Soul Senseis ▾, SoulSessions, Personal Sessions, Practice, Cart, My Sessions).
- **Concern tiles row:** Mind & Emotions, Relationships, Health, Soul, Wealth, Career.
- **Choose Your Practice chips:** Tarot & Astrology, Reiki & Energy Healing, Rewire Your Beliefs, Yoga & Breathwork, Meditation & Mindfulness, Sadhanas & Kirtans, Psychic & Angel Reading, Deep Inner Healing, Natural Remedies…
- **Format pills:** 1-on-1 Video Call · Online · In-Person.
- **4-col grid of portrait cards** mixing group workshops (date+time, price) and 1-on-1 offerings (duration, price), with badges MOST LOVED / 1-ON-1 GUIDANCE / FREE.
- Times are rendered client-side (the same workshop showed different clock times in server HTML vs rendered page → they localise to the viewer's browser time zone, but don't label the zone).

## 3. 1-on-1 listing `/live/personal`

- Sub-nav: SoulSessions · Personal Sessions · Practice · My Sessions.
- Concern tiles: Mind & Emotions, Relationships, Health, Career, Wealth, Soul & Purpose.
- Practice tiles: Readings & Guidance, Energy Healing, Mindset & Reflection, Channeling, Deep Inner Healing, Yoga & Breathwork, Remedies, Mindfulness, Bhakti Practices, Somatic Therapies, Body Practices.
- Cards: offering title, guide, **duration (15/30 min)**, price (₹1,694–₹2,965), "1-ON-1 GUIDANCE".

## 4. 1-on-1 offering detail ([screenshot](screenshots/one-on-one-detail.jpg))

Top → bottom:
1. "PERSONAL SESSION" corner tag; arched guide photo with offering title overlaid ("Tarot Reading").
2. Guide name, title ("Intuitive Tarot Reader & Reiki Master"), **"5+ Years of Experience"**.
3. **"A Message For You"** play button (intro video).
4. Info bar: **30 Minutes Duration · Online LIVE Session · English & Hindi**.
5. **Community Reviews** — 3 quote cards (anonymous).
6. **What's Included** — paragraph + 4 icon bullets (Tailored layout, Intuitive insights, Follow-up insights, Personalised guidance).
7. **Know Your Sensei** — credentials list (Reiki Level 1/2/Master).
8. **Not Feeling The Connection?** — alternative guides row + View All.
9. **FAQ** — slot scheduling, rescheduling, how to join, help contact, "why this session".
10. **Sticky bottom bar:** Session Fee ₹1999 · **Choose Time** → (login/slot picker — not tested).
11. Floating WhatsApp button.

## 5. Guide profile `/live/leader/{slug}` ([screenshot](screenshots/coach-profile.jpg))

1. Full-width hero photo on pink→plum gradient; name + specialty below.
2. About (truncated) + Read More.
3. **Join An Upcoming Workshop** — horizontal list item (thumbnail, title, date · price, Book Now).
4. **Handpicked Guides Trusted by 1,00,000+ Seekers** — other workshops carousel + View All.
5. Footer.

Missing vs. what US buyers expect: no rating/review count on profile, no availability calendar, no languages, no credentials summary at top, no "book 1-on-1" CTA from profile.

## 6. Collection `/live/workshop/collection/calm-anxiety`

- Title + practice chips + grid of portrait cards (same component as `/live`).
- Pure landing page for SEO/ads; no intro copy or FAQ (missed opportunity).

## 7. SoulSessions `/courses`

- "Group Workshops" with type filters: Meditation, Breathwork, Chanting, Visualisation, Inspiring Talk, Chakra Work, Energy Work, Daily Practices.
- Side filter "Benefits" = the full collection list.

## 8. Practice `/media/all`

- Free **video library** (2–7 min clips: practice videos, hero/trailer videos per workshop).
- Filters: Benefits, Forms (Demonstration, Knowledge, Practice, Theory), Length (<5, 5–10, 10–20, >20 min).
- Acts as free top-of-funnel content leading to paid workshops.

---

## Booking flow (inferred)

`Browse (home / listing / collection)` → `Detail page` → **Choose Time** / **Book Now** → *login (phone + OTP)* → *slot pick (1-on-1)* → `/checkout` cart → *payment* → *My Sessions* → join LIVE in app/web.
Italics = behind login, not verified.

## Business model signals

- Per-session pricing ₹592–₹2,965; FREE sessions as hooks; "Bundles", "Best Value", "Low Price" collections.
- Cart-based checkout (multiple sessions in one purchase).
- App-first: free workshop for installing the app.
- Content library (free) → paid live sessions.
- Offline events as a separate format.

---

## Implications for our build

| SoulSensei pattern | Our version |
|---|---|
| Concern → practice → format filters | Same 3-level discovery, plus **Language** and **For: Me / My Child / Family** filters |
| Portrait session card + badges | Keep; add **US time + IST** and language flag on card |
| Detail: intro video, info bar, included, FAQ, sticky CTA | Keep all; add verified reviews with rating, cancellation terms inline, "Free trial" badge for kids' classes |
| Guide profile | Upgrade: rating, languages, credentials, availability calendar, all offerings, verified badge |
| Collections + footer SEO list | Keep; add intro copy + FAQ per collection; festival collections (Diwali, Navratri) |
| Cart checkout | Keep cart (families book multiple kids' classes) |
| Free practice video library | Phase 2 — great for SEO and trust |
| App-first | Web-first PWA; app later |
| WhatsApp support | Keep — diaspora expects it |
| Phone + OTP login | Email/Google login + US phone (+1) for reminders; OTP optional |
