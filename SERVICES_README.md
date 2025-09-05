# Zayto Services & Apps – Overview

This document summarizes every service and app in the Zayto platform and how to run them in development.

## Services & Apps

- API Gateway (`backend/api-gateway`)
  - Express gateway that proxies to microservices
  - Dev: `npm run dev` (PORT 8080)

- Restaurants Service (`backend/services/restaurants`)
  - Restaurant catalog, menus, reviews read endpoints
  - Dev: `npm run dev` (PORT 3001)

- Users Service (`backend/services/users`)
  - Auth (email/password, Google, Apple, phone OTP)
  - Dev: `npm run dev` (PORT 3003)

- Reviews Service (`backend/services/reviews`)
  - Review CRUD
  - Dev: `npm run dev` (PORT 3004)

- Partner Service (`backend/services/partner`)
  - Partner-owned restaurants, menus, images (local or S3)
  - Dev: `npm run dev` (PORT 3005)

- Orders Service (`backend/services/orders`)
  - Orders, realtime SSE, payment stubs, webhooks
  - Dev: `npm run dev` (PORT 3006)

- Notifications Service (`backend/services/notifications`)
  - Push token registry, mock push send
  - Dev: `npm run dev` (PORT 3007)

- Web Frontend (`frontend`)
  - Next.js web application
  - Dev: `npm run dev` (PORT 3000)

- Mobile App (`mobile/app`)
  - Expo React Native app (iOS/Android/Web)
  - Dev: `npm run dev`

## Local Dev – Quick Steps

1) Start Postgres via Docker:
```
docker compose up -d postgres
```
2) Start services in separate terminals:
```
cd backend/api-gateway && npm install && npm run dev
cd backend/services/restaurants && npm install && npm run dev
cd backend/services/users && npm install && npm run dev
cd backend/services/reviews && npm install && npm run dev
cd backend/services/partner && npm install && npm run dev
cd backend/services/orders && npm install && npm run dev
cd backend/services/notifications && npm install && npm run dev
```
3) Frontend & Mobile:
```
cd frontend && npm install && npm run dev
cd mobile/app && npm install && npm run dev
```

## Documentation

- Local Dev & Deployment: `docs/LOCAL_DEV_AND_DEPLOYMENT.md`
