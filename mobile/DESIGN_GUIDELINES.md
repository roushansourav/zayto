# Zayto Mobile App – Design Guidelines

This document captures the visual rules extracted from the uploaded mobile mockups. It is the single source of truth for the React Native app (iOS/Android) and should be mirrored for the mobile web where applicable.

## Global
- Light and Dark modes must be fully supported.
- Bottom safe areas and status bars must be respected on all screens.
- Rounded corners: 8px base radius. Cards/inputs/buttons follow 8px.
- Elevation/shadow is subtle; prefer 1px borders with #EEEEEE (light) / #2B2B2B (dark).
- Typography:
  - Title (H1/H2/H3): Semi-bold/Bold, tight leading.
  - Body: 14–16px regular; captions 12–13px.
  - Numeric badges use semi-bold.

## Color
- Primary: #e23744
- Secondary/Accent: #1976d2
- Success (ratings/positive): #2e7d32
- Text Primary: #1c1c1c (light), #FAFAFA (dark)
- Text Secondary: #6b6b6b (light), #BDBDBD (dark)
- Surface: #FFFFFF (light), #121212 to #1A1A1A (dark)
- Divider: #EEEEEE (light), #2B2B2B (dark)

## Components
- Buttons: Filled (primary), Outlined, Tonal. No uppercase labels. Loading state uses a wavy overlay.
- Text Inputs: Leading icon, rounded 8px, error caption below; red outline on invalid.
- Chips: Rounded 24px, outlined by default; filled when selected.
- Cards (Restaurant, Menu): 8px radius, hero image 16:9. Rating chip at top-right of image.
- Skeletons: Rectangular shimmer for image, 2–3 lines for text.
- Dialogs: Rounded 16px, dim backdrop (blur if available). Two-button layout: primary filled on the right.

## Screen-by-Screen
- Splash: Logo centered over a curved blue hero shape.
- Onboarding: Three slides (Find Foods, Track Orders, Fast Delivery). “Skip/Next” bottom controls with dot indicator.
- Login: Username/email + password, “Forgot password?”, Google/Apple buttons, error state with red input borders. White and dark variants.
- Phone OTP: Number entry, code entry with 6 cells, success banner, resend link/timer.
- Home: Location chip at top, category scroller (circular thumbs), popular and near-you sections, recommendation row.
- Restaurant Listing: Filter bar (Sort/Price/Dietary), infinite scroll list of large image cards.
- Search: Search field, popular tags, category grid, empty state and suggestions.
- Restaurant Detail & Menu: Tabs/chips for sections, modifiers (sauce/topping) with prices, bottom sheet cart preview, “Add to cart” button with subtotal.
- Cart/Checkout: Pickup/Delivery toggle, pickup time sheet, payment method sheet (Wallet/Cash/Credit/PayPal), voucher banner, final pay button.
- Orders: Tabs (Process/History), order cards with status chips, reorder button.
- Tracking: Map with courier path, ETA bar, pickup details, “Call restaurant” link, QR scan for pickup, final “Give Feedback” CTA.
- Reviews/Rating: Star picker, negative/positive reasons with checkboxes, text field, optional tip (fixed $ and % tabs), success dialog.
- Favorites: List with “Buy” buttons; remove favorite confirmation dialog.
- Chat/Call: In-app audio UI, chat with message bubbles, quick reply chips, input bar, attachment/mic buttons.
- Profile/Balance/Settings: Balance card with charts, filters drawer/date-picker, settings toggles, security & privacy text.

## Motion
- Button loading: left-to-right wavy shimmer overlay.
- Screen transitions: iOS push/pop; Android default. Bottom sheets spring up.
- Rating success: brief scale-up on stars; dialog slides from bottom.

## Assets
- Use vector icons where possible; platform-specific glyphs for nav and actions.
- Images use rounded corners; cache and fade-in.

Adhere strictly to these rules during implementation.


