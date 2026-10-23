# Mobile API (v1)

JSON API for the mobile app. It runs the same rules as the website (shared code in `src/server/services`), so a booking made in the app behaves exactly like one made on the web.

Base URL: `https://<site>/api/v1` · Responses: `{ "data": … }` or `{ "error": { "code", "message" } }`

## Authentication

Sign-in uses Better Auth with the **bearer** plugin.

1. `POST /api/auth/sign-up/email` `{ name, email, password, timezone }` or `POST /api/auth/sign-in/email` `{ email, password }`, with header **`expo-origin: gurubridge://`** (the app's scheme, `siteConfig.appScheme`). Native apps send no `Origin`; auth calls without either are refused (anti-forgery).
2. Read the session token from the **`set-auth-token`** response header (also returned as `token` in the body).
3. Send it on every request: `Authorization: Bearer <token>`. Store it in the device's secure storage (Expo SecureStore).
4. `POST /api/auth/sign-out` with the same headers and a JSON body `{}` ends the session (the token stops working immediately).

When building the Expo app, prefer Better Auth's official Expo client plugin (`@better-auth/expo`), which handles this automatically.

## Conventions

- **Money** is in **paise** (₹1 = 100 paise) in booking/coupon fields; catalogue cards also include `priceInr` (rupees).
- **Times** are UTC ISO strings. Show them in the device's time zone; show `Asia/Kolkata` (IST) as the teacher's time.
- Errors: `400 invalid_input`, `401 unauthorized`, `403 forbidden`, `404 not_found`, `409 conflict`, `422 invalid_coupon`, `429 rate_limited`.

## Catalogue (public)

| Method | Path | Notes |
|---|---|---|
| GET | `/categories` | |
| GET | `/offerings?q=&category=&for=me\|kids\|family&language=&format=&price=` | Same filters as Explore |
| GET | `/offerings/:slug` | Details, coach (with `rating`), `upcoming` dates, latest `reviews` |
| GET | `/offerings/:slug/availability` | 1-on-1 → `{ format, slots: [ISO] }`; group/weekly → `{ format, sessions: [{ id, startsAt, seatsLeft }] }` |
| GET | `/coaches?category=&language=` | |
| GET | `/coaches/:slug` | Profile, `rating` (`{ avg, count }` or null), latest `reviews`, categories, verified credentials, classes |

## Signed-in

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/me` | | `{ id, name, email, role, timezone }` |
| GET | `/me/family` | | children / family members |
| POST | `/me/family` | `{ name, birthYear?, notes? }` | 201 `{ id, name }` |
| DELETE | `/me/family/:id` | | |
| GET | `/me/bookings` | | bookings (newest first) with `canCancel`, `canReview`, `myRating` |
| POST | `/coupons/preview` | `{ code, offeringId }` | `{ code, description, discountPaise, finalPaise }` |
| POST | `/bookings` | `{ offeringId, attendee: "self"\|familyMemberId, startsAt?, sessionId?, coupon? }` | 201 `{ bookingId, status }` — `confirmed` if free, else `pending_payment` until payments go live |
| POST | `/bookings/:id/cancel` | | allowed until 24 h before the class |
| POST | `/bookings/:id/review` | `{ rating: 1–5, comment? }` | 201 — only after the class has ended, once per booking (409 if already rated) |

## Sign-in optional

| Method | Path | Body |
|---|---|---|
| POST | `/requests` | `{ name?, email?, offeringId?, subject?, forWhom?, preferredTimes?, message?, timezone? }` — name/email default to the signed-in user |

## Not in the API (website only)

Admin (teacher approval, payouts, settings, offer codes) and the teacher dashboard stay on the website for now. Teacher features can be added to the API for a later "coach" version of the app.
