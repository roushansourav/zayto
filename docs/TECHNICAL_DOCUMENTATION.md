# Zayto Platform – Technical Documentation (Client + Backend)

This document is the authoritative technical reference for the Zayto food delivery platform across web, mobile (planned), and backend services. It covers high-level and low-level designs, user journeys, architecture, API contracts, error handling, design patterns, folder structure, and development strategy.

## 1. Product Scope and Personas

- Customer (end-user)
  - Discover restaurants, search/filter, view menus, place orders (future), submit reviews, manage profile, favorites
  - Auth via email/password, Google, Apple ID, phone OTP
- Restaurant Partner (owner)
  - Manage restaurant profile, hours, menu and items, receive and manage orders (future)
- Admin (future)
  - Promotions, moderation, configurations

## 2. User Journeys (Client)

- Authentication
  - Register → Login (email/password) → Token persisted → Access profile
  - Phone OTP: Request code → Enter code → Verify → Token issued
  - OAuth: Tap Google/Apple → Browser/App auth → Backend exchange → Token
- Discovery
  - Land on homepage → Header shows detected location → Horizontal category scroller → Filter chips → Restaurants grid/list with images, rating chips, and eager-loaded images → Modal with details + reviews
- Reviews
  - Open a restaurant → View reviews → Submit review form (rating + comment) → See new review in list
- Profile
  - If not logged in → redirect to /login; else profile displays user info and protected content

## 3. High-Level Architecture (HLD)

```mermaid
flowchart LR
  subgraph Client
    Web[Next.js (MUI)]
    Mobile[React Native (Expo) - planned]
  end

  subgraph Gateway
    APIGW[API Gateway (Express + http-proxy-middleware)]
  end

  subgraph Services
    USERS[users-service]
    RESTO[restaurants-service]
    REVIEWS[reviews-service]
    PARTNER[partner-service]
    ORDERS[(orders-service - planned)]
  end

  Client <--> APIGW
  APIGW --> USERS
  APIGW --> RESTO
  APIGW --> REVIEWS
  APIGW --> PARTNER
  APIGW --> ORDERS

  subgraph Data
    PG[(PostgreSQL)]
    S3[(Object Storage - optional)]
  end

  USERS <--> PG
  RESTO <--> PG
  REVIEWS <--> PG
  PARTNER <--> PG
  PARTNER <--> S3
```

- Local development orchestrated with Docker Compose; Kubernetes manifests for production deploys (services include readiness and liveness probes).
- CI/CD via GitHub Actions building services and running unit tests.

## 4. Low-Level Designs (LLD) – Backend Services

### 4.1 API Gateway (backend/api-gateway)
- Express app exposing
  - `GET /health` health data
  - `GET /` service catalog summary
- Proxies
  - `/api/restaurants` → `restaurants-service` (`/restaurants`)
  - `/api/users/*` → `users-service/*`
  - `/api/reviews/*` → `reviews-service/*`
  - `/api/partner/*` → `partner-service/*` (also forwards `/uploads/*`)
- Cross-cutting
  - CORS enabled for web/mobile
  - Global error handler + 404 fallback JSON

### 4.2 restaurants-service (backend/services/restaurants)
- Express + pg
- Core endpoints
  - `GET /restaurants` – returns list with rating, image_url, etc. (add pagination in roadmap)
  - `GET /restaurants/:id` – detail (roadmap)
- DB
  - `restaurants` table with core attributes; migration adds `rating` column if missing

### 4.3 users-service (backend/services/users)
- Express, JWT, bcryptjs, joi
- Endpoints
  - `POST /register` – email, password, name → JWT issue
  - `POST /login` – email/password → JWT issue
  - `GET /health` – health status
  - `GET /profile` – profile by header `x-user-email` (demo)
  - OAuth (dev stubs): `/auth/google`, `/auth/apple`
  - Phone OTP: `/auth/otp/request`, `/auth/otp/verify` (in-memory codes for dev/tests)
- JWT strategy
  - HS256 with secret in env; tokens validate on partner-service as well

### 4.4 reviews-service (backend/services/reviews)
- Express + pg
- Endpoints
  - `GET /reviews?restaurant_id=...` – list
  - `POST /reviews` – create
- DB
  - `reviews(id, restaurant_id, user_id, rating, comment, created_at)`; index on `restaurant_id`

### 4.5 partner-service (backend/services/partner)
- Express + pg + multer (local uploads) + optional S3
- Endpoints (v1)
  - `GET /health`
  - Restaurants (owner-bound)
    - `GET /restaurants` – list partner’s restaurants
    - `POST /restaurants` – create
  - Business Hours
    - `GET /restaurants/:id/hours`
    - `PUT /restaurants/:id/hours` – replace weekly schedule
  - Categories
    - `GET /restaurants/:id/categories`
    - `POST /restaurants/:id/categories`
    - `PUT /restaurants/:id/categories/:categoryId`
    - `DELETE /restaurants/:id/categories/:categoryId`
  - Menu Items
    - `GET /restaurants/:id/menu-items[?categoryId]`
    - `POST /restaurants/:id/menu-items`
    - `PUT /restaurants/:id/menu-items/:itemId`
    - `PATCH /restaurants/:id/menu-items/:itemId/availability`
    - `DELETE /restaurants/:id/menu-items/:itemId`
  - Image Uploads
    - `POST /restaurants/:id/menu-items/:itemId/image` – multipart `image`
    - `DELETE /restaurants/:id/menu-items/:itemId/image`
- Auth
  - `Authorization: Bearer <jwt>` required; claim `role=partner` enforced
- Storage
  - Local: served under `/uploads/*` via API GW
  - S3: presigned GET or public base URL; cleanup on delete
- DB
  - `restaurants(id, owner_user_id, name, ... is_open, is_verified)`
  - `business_hours(restaurant_id, day_of_week, open_time, close_time, is_closed)`
  - `menu_categories(restaurant_id, name, position)`
  - `menu_items(restaurant_id, category_id, name, description, price_cents, image_url, is_available)`

### 4.6 orders-service (planned)
- State machine for order lifecycle; partner/customer APIs; SSE/WebSocket channel per restaurant; push notification triggers.

## 5. HLD – Client (Web) Implementation

### 5.1 Technology
- Next.js 15 (React 19), TypeScript, MUI v7
- Static export enabled in `next.config.ts` with `output: 'export'` for production; dev uses `next dev`
- Auth Context for session state (`src/lib/AuthContext.tsx`), wrapped in `_app.tsx`

### 5.2 Structure

```
frontend/
  pages/
    index.tsx            # homepage composition
    login.tsx            # MUI login with OTP + OAuth buttons
    register.tsx         # MUI register
    profile.tsx          # private route behavior
    partner/*.tsx        # onboarding, dashboard, menu, hours
  src/
    components/
      home/{HomeHeader,CategoryScroller,FilterChips}.tsx
      discovery/{DiscoveryPage,SkeletonCard}.tsx
      layout/LoadingButton.tsx
      partner/PartnerGuard.tsx
    theme/{ThemeRegistry,EmotionCache,theme.ts}
    lib/AuthContext.tsx
```

- Component patterns
  - Stateless presentational components with props for data; stateful containers for fetching/side-effects
  - Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`
  - Accessibility: buttons and inputs use MUI semantics; images have `alt`

### 5.3 UI/UX Standards
- Material UI as the primary kit (AppBar, Paper, Card, Button, TextField, Chip, Tabs, Dialog)
- Loading affordances: Skeletons and wavy overlay in `LoadingButton`
- Responsive rules: breakpoints xs/sm/md; mobile-first layout
- Eager image loading on restaurant thumbnails; graceful fallback images

## 6. API Contracts (Selected)

### 6.1 Auth – users-service

- Register
```
POST /api/users/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "secret",
  "name": "Alex"
}
→ 201
{
  "success": true,
  "data": { "token": "<jwt>", "email": "user@example.com" }
}
```

- Login
```
POST /api/users/login
{
  "email": "user@example.com",
  "password": "secret"
}
→ 200 { "success": true, "data": { "token": "<jwt>" } }
```

- OTP
```
POST /api/users/auth/otp/request { "phone": "+15550001111" }
POST /api/users/auth/otp/verify { "phone": "+15550001111", "code": "123456" }
```

### 6.2 Restaurants – restaurants-service

```
GET /api/restaurants
→ 200 {
  "success": true,
  "data": [
    { "id": 1, "name": "Cafe", "rating": 4.7, "image_url": "...", ... }
  ]
}
```

### 6.3 Reviews – reviews-service

```
GET /api/reviews?restaurant_id=1 → { success: true, data: [ { id, rating, comment, created_at } ] }
POST /api/reviews { restaurant_id, rating, comment } → { success: true, data: { id, ... } }
```

### 6.4 Partner – partner-service (excerpts)

- Categories
```
GET /api/partner/restaurants/:id/categories
POST /api/partner/restaurants/:id/categories { name, position? }
```

- Menu Items
```
GET /api/partner/restaurants/:id/menu-items[?categoryId]
POST /api/partner/restaurants/:id/menu-items {
  category_id?, name, description?, price_cents, is_available?
}
PATCH /api/partner/restaurants/:id/menu-items/:itemId/availability { is_available }
```

- Image Upload
```
POST multipart /api/partner/restaurants/:id/menu-items/:itemId/image  (field: image)
DELETE /api/partner/restaurants/:id/menu-items/:itemId/image
```

### 6.5 Error Envelope

All services return a consistent envelope:
```
{ "success": false, "error": "<message>", "code?": "<machine_code>", "details?": { ... } }
```

## 7. Error Handling Strategy
- Validation: joi schemas per payload; return 400 with explicit messages
- Auth: 401 on missing/invalid token; 403 on role/ownership violations
- Server: 500 for unexpected failures; masked details with logs preserved
- Gateway: 404 JSON for unknown routes; global error middleware logs stack

## 8. Security and Roles
- JWT-based auth with `role` claim: `user` (default), `partner`
- Partner-service enforces ownership (`owner_user_id`) for every `:restaurantId`
- CORS enabled with minimal origins in prod; HTTPS required
- File uploads restricted to image types; file size limits; S3 keys validated

## 9. Data and Schema Notes
- All IDs are integers (Postgres sequences); timestamps use `TIMESTAMP` with server time
- Price is stored as `price_cents` (integers) to avoid floating point errors
- Indexes
  - `idx_reviews_restaurant_id`
  - Add indexes for `menu_items(restaurant_id)`, `menu_categories(restaurant_id)` as needed

## 10. Design Patterns and Conventions
- Backend
  - Express route/controller style with small handlers; shared middlewares for auth
  - Separation of concerns: validation → handler → data access (pg via pool)
  - Idempotent migrations (CREATE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
- Frontend (web)
  - Container + Presentational components
  - Hooks for side effects and memoization
  - MUI theme for tokens; component overrides for consistent look

## 11. Development Strategy
- Environments
  - `.env` locally; Compose injects env to containers; K8s uses Secrets/ConfigMaps
- CI/CD (GitHub Actions)
  - Matrix builds for services and frontend; install → build → lint → test
- Release
  - Frontend static export hosted via NGINX container in prod; dev uses `next dev`
  - Services deployed as independent containers; k8s manifests per service
- Branching
  - `main` protected; PRs with CI required; semantic commit messages encouraged

## 12. Observability & Operations
- Health endpoints on all services (`/health`)
- Logs to stdout with timestamps (container-friendly)
- Future
  - Structured logging and metrics (OpenTelemetry), distributed tracing when gateway emits correlation IDs

## 13. Testing
- Backend: Jest + Supertest per service (health, happy-paths, validation errors)
- Frontend: Unit tests for pure utils and critical components (planned); E2E via Playwright (planned)
- Mobile (planned): RN Testing Library for components; Detox for auth + basic flows

## 14. Roadmap Highlights
- Orders-service to support cart/checkout, tracking, and push notifications
- Payment integrations (Stripe/PayPal) with webhooks and secure tokenization
- Admin portal for promotions, moderation, service configuration

## 15. Appendix – Environment Variables (excerpts)

- API Gateway
  - `PORT=8080`
- Users
  - `JWT_SECRET`, `NODE_ENV`
- Restaurants
  - `DATABASE_URL`
- Reviews
  - `DATABASE_URL`
- Partner
  - `DATABASE_URL`, `JWT_SECRET`
  - Image uploads: `STORAGE_DRIVER=local|s3`, `UPLOAD_MAX_BYTES`, `UPLOAD_DIR`
  - S3: `S3_BUCKET`, `S3_REGION`, `S3_BASE_URL`, `S3_ENDPOINT?`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE?`

---

This document evolves with the system. Any new endpoint, schema, or cross-cutting concern must be reflected here.
