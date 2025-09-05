# Restaurant Owner (Partner) App – Phase-wise Plan

Reference design: Restaurant-side Figma (screens, IA) – follow layouts/screens 1:1, but apply tokens and component rules from `mobile/DESIGN_GUIDELINES.md`.

Figma: https://www.figma.com/design/LuBn407bhEIkxsP2P8VIcO/Food-Delivery-App---Restaurant-side-App---Community-?node-id=0-1&p=f&t=K0Y9jl0zXcRMdnxd-0

## Goals
- Native app for restaurant owners to manage profile, menu, hours, and orders.
- Real-time order queue, status updates, chat/call with customer/courier.
- Payouts/balance, analytics, promotions.

## Tech (aligned with client app)
- Expo RN (iOS/Android) + TypeScript
- React Navigation (Native Stack + Drawer)
- React Native Paper; shared tokens from `DESIGN_GUIDELINES.md`
- React Query + Axios; SecureStore for JWT
- Reanimated, Lottie (small accents)
- EAS, OTA

## Phases

### P0 – Foundation
- Project scaffold, theming, navigation (AuthStack + Drawer: Dashboard, Orders, Menu, Hours, Promotions, Payouts, Settings)
- Component kit reuse (Button, Input, Card, Dialog, Skeleton)

### P1 – Auth & Onboarding
- Login (email/password, OTP, Google/Apple)
- Partner role check; if not partner → info page
- First-time onboarding wizard: business details, address, KYC (stub), category tags

### P2 – Restaurant Management
- Profile: name, description, images (logo/cover), address/geocode
- Hours editor (weekly schedule) – wired to partner-service
- Locations (if multi-store) – v2 placeholder

### P3 – Menu Management
- Categories CRUD
- Items CRUD with price, availability toggle, options/modifiers (v2)
- Image upload (uses S3/local via partner-service)

### P4 – Orders Dashboard
- Real-time order list (New, Preparing, Ready, Completed, Canceled)
- Order detail: items, notes, totals, ETA, customer info (masked)
- Actions: Accept/Reject, set prep time, mark Ready/Picked up/Delivered
- QR scan handoff (pickup)

### P5 – Communication
- In-app chat with customer/courier; quick replies
- Call shortcut (via tel: or provider)

### P6 – Promotions & Coupons
- Create/enable/disable coupons (v2 service)
- Promo analytics (usage, uplift)

### P7 – Balance & Payouts
- Balance card; payouts list; daily/weekly charts
- Payout method onboarding (stubbed if PSP not ready)

### P8 – Analytics
- Orders trend, AOV, conversion, top items, busy hours

### P9 – Settings & Notifications
- Notifications toggle; business state (Open/Closed)
- Staff accounts (v2); language

### P10 – QA & Release
- Test plans, E2E for order lifecycle, OTA rollout

## Backend Plan (deltas)

Existing partner-service already covers:
- Restaurants CRUD (owner bound)
- Hours endpoints
- Categories & menu items CRUD
- Image upload (local/S3)

Required/Extended services:

1) Orders-service (new)
- Entities: orders, order_items, order_events, payments, courier_assignment
- State machine: NEW → ACCEPTED → PREPARING → READY → PICKED_UP/DELIVERED → COMPLETED; REJECTED/CANCELED branches
- Endpoints (partner-facing):
  - GET /partner/orders?status=&cursor=
  - POST /partner/orders/:id/accept {prep_minutes}
  - POST /partner/orders/:id/reject {reason}
  - POST /partner/orders/:id/status {status}
  - GET /partner/orders/:id
- Realtime: WebSocket/SSE channel per restaurant for new orders/updates
- Webhooks to payment provider (future)

2) Notifications (new)
- Register push token (user/partner)
- Send pushes on new order, status changes

3) Chat Gateway (optional v1)
- Token issuance for chat provider (Twilio/Stream); message webhook relay

4) Users-service
- Ensure role-based JWT claim (role=partner)
- Staff accounts (later)

5) API Gateway
- Proxy /api/partner/orders/* to orders-service
- Proxy /api/partner/notifications/* as needed

6) Reporting (v2)
- Aggregations for analytics & payouts summaries

## Data Contracts (partner)
- PartnerOrderSummary: id, status, created_at, ETA, customer_masked, totals
- PartnerOrderDetail: summary + items[], notes, delivery/pickup, events[]
- Category: id, name, position
- MenuItem: id, name, description, price_cents, is_available, image_url

## Security
- Enforce ownership checks on every partner endpoint
- JWT validation; rate-limits on mutating actions

## Acceptance
- Visual parity with FIGMA (screen composition) under `DESIGN_GUIDELINES.md`
- End-to-end order lifecycle from accept to complete
- Offline-resilient dashboard (retry/polling) + realtime when available
