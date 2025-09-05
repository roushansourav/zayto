# Zayto Mobile App – Phase-wise Plan (iOS, Android, Mobile Web)

This plan covers an Expo-based React Native app (iOS/Android) and a responsive mobile web shell for parity. It integrates with the current backend and outlines backend deltas where needed.

## Tech
- Expo SDK 51+, React Native 0.74+, TypeScript
- React Navigation (Native Stack + Bottom Tabs)
- React Native Paper (Material 3), Vector Icons
- React Query, Axios
- i18n (react-i18next) – locales: en, ar
- SecureStore (tokens), MMKV cache
- Expo Auth Session (Google, Apple)
- Expo Image (caching), Reanimated
- EAS Build & Submit, OTA Updates

## Environments
- EXPO_PUBLIC_API_URL per stage
- OAuth Redirect URIs registered for app schemes and universal links

## Phases

### Phase A: Foundation & Theming
- Initialize Expo project, TypeScript, linting
- Theme tokens from `frontend/src/theme/theme.ts` mirrored (colors, radius, typography)
- Navigation scaffolding: AuthStack, AppTabs (Home, Order, Cart, Profile)
- Component kit: Button (wave loading), TextInput, Card, Chip, Skeleton, Dialog
- Internationalization setup; RTL ready

### Phase B: Onboarding & Auth
- Splash + 3-slide onboarding (skip/next, dots)
- Login (email/password) with error states
- Register (name/email/password)
- Phone OTP (request/verify)
- Social login buttons wired (Google/Apple) via expo-auth-session → backend exchange
- Persist JWT in SecureStore, axios interceptors, 401 handling

### Phase C: Discovery & Search
- Home: location chip (GPS/permission), categories scroller, sections
- Restaurants list with filters (Sort/Price/Dietary), infinite scroll, skeletons
- Search screen: tags grid, suggestions, empty state
- Restaurant details: menu tabs, modifiers, add-to-cart bottom bar

### Phase D: Cart & Checkout
- Cart: edit quantities, notes, modifier pricing
- Pickup/Delivery toggle; pickup time sheet
- Payment method sheet (Cash, Card, PayPal; wallet stub)
- Voucher banner; totals; pay CTA

### Phase E: Orders, Tracking, Reviews
- Orders list (Process/History), reorder
- Live tracking: map, ETA bar, call/chat shortcuts; QR flow for pickup
- Reviews: star picker, reasons, tip ($/%), success dialog
- Favorites list with remove confirmation dialog

### Phase F: Profile & Settings
- Profile overview; balance page with charts (stub), filters drawer, date picker
- Settings toggles; Security & Privacy page
- Logout; account language

### Phase G: Partner Opt-in (optional v1)
- Read-only partner dashboard (list of owned restaurants)

### Phase H: Mobile Web Parity
- Responsive tweaks for React Native Web (Expo web) for marketing/demo scope

## Backend Integration
- Reuse current services via API Gateway
- Required changes:
  1) Users-service
     - Add endpoint to exchange Google/Apple auth session tokens for JWT (already stubbed)
     - Add optional wallet balance endpoints (v2)
  2) Restaurants-service
     - Pagination & filter query params for mobile lists
     - Search endpoint refinement
  3) Orders-service (new, Phase 4+ roadmap)
     - Place order, track status, courier location, chat proxy, payments
  4) Notifications (Phase 4+)
     - Push tokens registration; order status push

## Data Contracts (mobile critical)
- Restaurants list item: id, name, image, rating, price band, tags, distance (optional), ETA
- Menu item: id, name, description, price_cents, image_url, modifiers[]
- Cart payload: restaurant_id, items[{menu_item_id, qty, modifiers[]}]
- Order entity: id, items, totals, status, timestamps, pickup/delivery info

## Security
- JWT in SecureStore; CSRF not applicable to app; use HTTPS
- Minimal scopes; 401 → logout
- Rate-limit OTP endpoints; abuse protection

## Analytics & QA
- Screen events; error boundary logging
- Unit tests per feature; Detox E2E for auth + checkout

## Deliverables per Phase
- Feature-complete screens, wired API calls, tests, basic docs and EAS profiles.
