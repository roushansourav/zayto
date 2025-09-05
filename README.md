# Zayto Monorepo

Zayto is a microservices-based food delivery platform with a Next.js web app and an Expo React Native mobile app.

## Services & Apps

- API Gateway (Express) – `backend/api-gateway` – port 8080
- Restaurants Service (Express + Postgres) – `backend/services/restaurants` – port 3001
- Users Service (Express) – `backend/services/users` – port 3003
- Reviews Service (Express + Postgres) – `backend/services/reviews` – port 3004
- Partner Service (Express + Postgres) – `backend/services/partner` – port 3005
- Orders Service (Express + Postgres, SSE) – `backend/services/orders` – port 3006
- Notifications Service (Express + Postgres) – `backend/services/notifications` – port 3007
- Web Frontend (Next.js 15) – `frontend` – dev port 3000
- Mobile App (Expo RN) – `mobile/app`

## Quick Start (Local)

1) Database
```
docker compose up -d postgres
```

2) Backend (separate terminals)
```
cd backend/api-gateway && npm install && npm run dev
cd backend/services/users && npm install && npm run dev
cd backend/services/restaurants && npm install && npm run dev
cd backend/services/reviews && npm install && npm run dev
cd backend/services/partner && npm install && npm run dev
cd backend/services/orders && npm install && npm run dev
cd backend/services/notifications && npm install && npm run dev
```

3) Frontend
```
cd frontend && npm install && npm run dev
```

4) Mobile
```
cd mobile/app && npm install && npm run dev
```

## Docs

- Local dev and production deployment: `docs/LOCAL_DEV_AND_DEPLOYMENT.md`
