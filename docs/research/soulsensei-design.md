# SoulSensei — Design System Teardown

Source: public pages of https://www.soulsensei.in, captured 2026-10-15 (CSS bundles, rendered HTML, full-page screenshots in [screenshots/](screenshots/)).
Purpose: learn the *patterns* that work. We do **not** copy their palette, fonts, imagery or copy — section 9 gives our own direction.

---

## 1. Tech stack (observed)

| Area | What they use |
|---|---|
| Framework | **Next.js** (App Router, `/_next/static`), mostly client-rendered listing pages; profile pages server-rendered |
| Styling | **Tailwind CSS + DaisyUI** (DaisyUI tokens `--p`, `--s`, `--rounded-btn: .5rem`, `--rounded-box: 1rem`) |
| Carousels | **Swiper** |
| Phone login | `react-phone-number-input` (country-code picker → phone + OTP login) |
| Images | **Gumlet** CDN (`soulsensei.gumlet.io`) |
| Support | Floating **WhatsApp** button on detail pages |
| Apps | Android + iOS apps; web pushes "Download the App and get a FREE Workshop" |

## 2. Colour palette

A single-hue, **dark plum / aubergine** theme with a warm coral accent. Almost every surface is a shade of the same purple.

| Role | Hex | Where |
|---|---|---|
| Page background (darkest) | `#2E0A16` | Body, footer, primary button bg |
| Surface dark | `#3C1538` / `#471C35` | Section bands, text on light cards |
| Surface mid | `#54204E` / `#5B2544` | Cards, header, tile bg |
| Surface accent purple | `#6C3664` / `#7C347E` | Card headers ("What's Included"), badges |
| Muted mauve | `#996677` / `#B889AE` | Gradient ends, secondary text |
| Light tint | `#EFD7EB` / `#F7EAF4` / `#FEF5FC` | Stats strip card, light panels |
| **CTA accent (coral)** | `#FB9591` → `#FFC7A6` | Hero "Explore Workshops" pill (coral→peach gradient), "1-ON-1 GUIDANCE" badge |
| Magenta pop | `#C82DB1` | Small highlights |
| Alert red | `#EF233C` | "LIVE NOW" pill |
| Star yellow | (amber) | Review stars |

Gradients are everywhere: hero = mauve (`#8a4a6a`-ish) → plum; section bands alternate **mauve-gradient** and **near-black plum**.

## 3. Typography

| Font | Use |
|---|---|
| **Montserrat** (600–700) | Headings, nav, card titles — the dominant face |
| **EB Garamond** | Most-used family in CSS (56 rules) — editorial/serif accents, logo-like text |
| **Rubik** | UI labels, buttons |
| **Roboto Serif** | Quotes / testimonials |
| **Inter** | Small UI text |
| **Mea Culpa** | Decorative script accents |

Six families is too many — a lesson for us (pick 2).
Sizes: H1 ~40px (desktop) centred, sub-heading ~18px light weight, card titles 14–16px bold white, meta 11–12px.

## 4. Layout & spacing

- Desktop container ~1100–1200px, centred; generous vertical padding (80–120px per section).
- Base spacing unit 4px; radii: buttons pill/8px, cards 12–16px, tiles 8px.
- Sections alternate background tone to create rhythm (dark → mauve gradient → dark).
- Horizontal scroll rows (Swiper) for guides, workshops, testimonials; marquee-style auto-scrolling testimonials.
- Sticky bottom bar on detail pages: **"Session Fee: ₹1999 | Choose Time"**.

## 5. Navigation

**Header (marketing home):** logo left, "My Sessions" right — very minimal.
**Header (app pages `/live`, detail):** Logo · Categories ▾ · Our Soul Senseis ▾ · SoulSessions · Personal Sessions · Practice · 🛒 Cart · (My Sessions) pill button.
**Footer:** logo, 3 stat icons, app-download card (Play/App Store badges), link row (About, 1-on-1, Group, Offline, Contact, Cancellation, Privacy, Terms), company address, social icons, a huge "Popular Links" SEO list of ~90 collections, collapsible "Know more about LIVE workshops" SEO text bar.

## 6. Components

| Component | Description |
|---|---|
| **Concern tile** | ~90×90 square, rounded 8px, image of a person/object on purple, uppercase 2-line label ("CALM YOUR MIND", "MANIFEST WEALTH"). Grid of 3×3 on home; horizontal row on `/live`. |
| **Practice tile** | Same shape, illustrative image (tarot cards, zodiac wheel), label ("TAROT READING"). |
| **Practice chip row** | Rectangular outlined chips with 2-line uppercase text ("TAROT & ASTROLOGY", "REIKI & ENERGY HEALING"). |
| **Format filter pills** | Small outlined pills with icon: "1:1 1-on-1 Video Call", "Online", "In-Person". |
| **Session card (portrait)** | ~145×150 (4:5) photo of the guide, dark gradient overlay at bottom, centred **title** (bold white, 2 lines), guide name, date/time, price. Top-left **ribbon badge**: MOST LOVED (purple), 1-ON-1 GUIDANCE (coral), FREE. 4-column grid on desktop. |
| **Guide card (tall)** | Photo on light-pink bg, name large bold white over gradient, specialty 2 lines small. Horizontal carousel. |
| **Stats strip** | Light pink rounded card with 3 icon+number+caption items. |
| **Testimonial card** | White card, avatar circle, name, 5 stars, 2–3 line text; two auto-scrolling rows. Rating badge "4.7★ Average Session Rating" with laurel wreath. |
| **Detail info bar** | Purple header "PERSONALISED EXPERT GUIDANCE" + 3 cells: Duration · Online LIVE Session · Languages. |
| **"A Message For You" button** | Pill with play icon → guide's intro video. |
| **Accordion FAQ** | Purple header bar, rows with chevrons. |
| **Cross-sell banner** | "NOT FEELING THE CONNECTION?" + row of guide thumbnails + "View All". |
| **App promo card** | Rounded gradient card, phone mockup with QR code, store badges, "Continue To Web" link. |
| **Hero** | Centred headline + subline + coral pill CTA; phone mockup showing a LIVE video, flanked by two rows of auto-scrolling guide portrait tiles labelled by role ("Pranic Healer", "Karma Coach"). |

## 7. Imagery & tone

- Real guide photography everywhere — faces sell trust. Mostly women, warm studio lighting, purple-tinted backdrops.
- Titles are benefit-led and emotional ("Manifest Like A Millionaire", "Balance Chakras To Feel Emotionally Calm"); Hinglish is used freely ("Pendulum Se Clarity Paaiye", "Navdurga: Apne Andar ki 9 Deviyon ko Jaane").
- Copy voice: "Seekers", "Guides", "Senseis", "Healing journey".
- Prices in ₹, shown openly on every card (₹592–₹2,965).

## 8. What works / what to avoid

**Borrow (patterns):**
1. Concern-first discovery ("what's troubling you?") before practice-first.
2. Portrait session cards with ribbon badges (MOST LOVED / FREE / 1-ON-1).
3. Guide intro video ("A Message For You") on detail pages.
4. Sticky price + "Choose Time" bar.
5. Info bar: duration · format · **languages**.
6. Cross-sell "Not feeling the connection?" guide row.
7. Collection pages as SEO landing pages + big footer link list.
8. WhatsApp support button.
9. Stats + rating badge as trust signals.

**Avoid / improve:**
1. Six font families → use 2.
2. Single dark-purple theme reads "mystic/occult" — too narrow for our all-categories, family-oriented audience (kids' dance, tutoring, fitness).
3. Low contrast small text on purple (11px mauve on plum) — fails accessibility.
4. Inconsistent claims (1,00,000+ vs 50,000+ seekers) — keep numbers consistent and honest.
5. Anonymous testimonials on detail pages → show verified-booking reviews with first name + city.
6. Hero relies on app download; we should lead with web booking (diaspora on laptops, and avoid store fees early).
7. Times must be explicitly labelled with the viewer's time zone (e.g. "Sat 9:00 AM ET · 6:30 PM IST").
8. Empty hero "Your Healing, Your Way" section rendered blank in capture — carousels without content hurt.

## 9. Our direction (proposal — not a copy)

| Token | Proposal | Why |
|---|---|---|
| Primary | Deep indigo/peacock `#1E3A5F` or teal `#0F5257` | Calm, trustworthy, not "occult" |
| Accent | Saffron/marigold `#F2A33A` | Indian, festive, high-contrast CTA |
| Secondary accent | Kumkum red `#C2410C` (sparingly) | Festival highlights, LIVE badge |
| Background | Warm ivory `#FFF9F0` (light) + dark mode `#0F172A` | Light-first for families; full dark mode |
| Text | `#1F2937` on ivory | AA contrast |
| Fonts | **Fraunces** or **Playfair Display** (headings) + **Inter** (UI/body) | 2 families only |
| Motifs | Subtle rangoli / mandala line patterns, marigold garland dividers | Cultural warmth without being kitsch |
| Radii | 12px cards, full-pill buttons | Friendly |

Card patterns (portrait session card, badges, sticky booking bar, info bar with **languages + US time**) carry over; the visual skin is ours.
