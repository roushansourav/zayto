# Zayto Mobile (React Native + Expo) – Phase-wise TODOs

## Phase A – Foundation & Theming
- [x] Add navigation (Native Stack + Bottom Tabs)
- [x] Port theme tokens from web; implement Paper theme
- [x] Prepare app icons and splash assets
- [x] Initialize Expo app (TS, ESLint, Prettier, Jest)
- [x] Configure EAS profiles (dev, preview, production)
- [x] Build shared components: Button (wavy loading), TextInput, Card, Chip, Skeleton, Dialog
- [x] Setup i18n (en/ar) and RTL support

## Phase B – Onboarding & Auth
- [x] Login screen (email/password) with errors and disabled states
- [x] Register screen (name/email/password)
- [x] Phone OTP (request + verify), countdown + resend
- [x] Social login via expo-auth-session (Google/Apple) → backend exchange
- [x] SecureStore JWT; Axios instance + 401 interceptor; soft logout
- [x] Splash and 3-slide onboarding with dots and skip/next

## Phase C – Discovery & Search
- [x] Home header with location chip (permission + GPS)
- [x] Category scroller (circular thumbs) and sections (popular, near you, recommendation)
- [x] Restaurant list (filters: sort/price/dietary), infinite scroll, skeletons
- [x] Search: field, tags, category grid, suggestions, empty results
- [x] Restaurant detail/menu: chips for sections, modifiers/options, add notes, bottom cart bar

## Phase D – Cart & Checkout
- [x] Cart: list items, edit quantities, remove, notes, modifiers pricing
- [x] Delivery/Pickup toggle; pickup time sheet UI
- [x] Payment method sheet (cash, card, PayPal) – integrate when backend ready
- [x] Voucher banner, totals, pay CTA

## Phase E – Orders, Tracking, Reviews
- [x] Orders list (Process/History) with status chips and reorder
- [x] Live tracking with SSE status updates and ETA; enhance map/call/QR next
- [x] Reviews: star picker, reasons (checkboxes), tip ($/%), success dialog
- [x] Favorites: list + remove confirmation dialog

## Phase F – Profile & Settings
- [x] Profile overview with balance card & mini-chart (stub)
- [x] Balance list with filters dialog and date-picker
- [x] Settings toggles; Security & Privacy page
- [x] Logout and language switch

## Phase G – Partner (read-only v1)
- [ ] Dashboard: list owned restaurants (implemented in separate partner app)

## Phase H – Mobile Web Parity
- [x] Enable RN Web target; adjust layouts for web width breakpoints

---

# Backend Enhancements – TODOs

## Restaurants-service
- [x] Add search to GET /restaurants
- [x] Add pagination parameters to GET /restaurants (page, limit, sort, priceRange, dietary)

## Users-service
- [x] Harden Google/Apple token exchange endpoints for mobile redirect URIs
- [ ] Optional: wallet balance endpoints (v2)

## Orders-service
- [x] Design schema: orders, order_items, statuses, events
- [x] API: place order, get orders, get order details
- [x] Realtime tracking via SSE endpoint (/api/orders/:id/stream)
- [x] Reorder endpoint
- [x] Cancel endpoint
- [x] Webhook/payment integration stubs (Stripe/PayPal, Telr, Paytabs, APS, UPI, PhonePe, Paytm)
- [x] Push notifications triggers (see Notifications)

## Notifications
- [x] Endpoint to register Expo push token per user + platform
- [x] Events → push (order accepted, preparing, out-for-delivery, delivered)

## Chat/Voice (phase 4+)
- [ ] Choose provider (Twilio/Stream) and gateway endpoints for session tokens

---

# Acceptance Criteria per Phase
- All screens visually match DESIGN_GUIDELINES.md for light/dark.
- Network errors produce non-blocking toasts or inline messages.
- Unit tests for forms; E2E for auth + basic checkout path.
