# Zayto – Local Development & Production Deployment Guide

This guide walks you through running the full Zayto stack locally (web frontend, mobile app, backend microservices) and deploying to production with CI/CD and cloud infra.

## Prerequisites

- Node.js 20+ and npm 10+
- Git, Docker Desktop (for Postgres via compose)
- Expo CLI (npx ok), Android Studio and/or Xcode
- AWS account (for production examples)

## Repository Structure

- backend/ – API Gateway and microservices
- frontend/ – Next.js 15 web app
- mobile/app/ – Expo React Native client app
- docs/ – Documentation

## Environment Modes

- dev, staging, prod across all apps

### Env files

```
cp backend/services/users/env.example backend/services/users/.env.dev
cp backend/services/users/env.example backend/services/users/.env.staging
cp backend/services/users/env.example backend/services/users/.env.prod

cp backend/api-gateway/env.example backend/api-gateway/.env.dev
cp backend/api-gateway/env.example backend/api-gateway/.env.staging
cp backend/api-gateway/env.example backend/api-gateway/.env.prod

cp backend/services/orders/env.example backend/services/orders/.env.dev
cp backend/services/orders/env.example backend/services/orders/.env.staging
cp backend/services/orders/env.example backend/services/orders/.env.prod

cp frontend/env.example frontend/.env.local
```

Populate DB URLs, JWT secrets, OAuth IDs, and webhook secrets.

## Start Locally

1) Database
```
docker compose up -d postgres
```

2) Backend
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

### Health Checks

- API Gateway: http://localhost:8080/health
- Restaurants: http://localhost:3001/health
- Users: http://localhost:3003/health
- Reviews: http://localhost:3004/health
- Partner: http://localhost:3005/health
- Orders: http://localhost:3006/health
- Notifications: http://localhost:3007/health

## Authentication (Dev)

- Email/password, Google/Apple (ALLOW_DEV_OAUTH), phone OTP (code returned in non-prod)

## Realtime & Push

- Orders SSE: GET /orders/:id/stream
- Register token: POST /notifications/push/register
- Send (mock): POST /notifications/push/send

## Payments (Stubs)

- Initiate: POST /payments/initiate { provider, order_id }
- Webhooks: /webhooks/{stripe,paypal,telr,paytabs,aps,upi,phonepe,paytm}

---

# Production Deployment (AWS Reference)

- RDS Postgres, ECS Fargate or EKS, ALB, ECR, S3 + CloudFront, Secrets Manager
- Expo EAS for mobile

## Build & Push (backend)
```
# Example
cd backend/services/orders
aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com
docker build -t orders-service:prod .
docker tag orders-service:prod <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/orders-service:prod
docker push <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/orders-service:prod
```

## Frontend Deploy
```
cd frontend
npm ci && npm run build
aws s3 sync ./out s3://<bucket>/ --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

## Mobile Deploy (Expo EAS)
```
cd mobile/app
npx expo login
npx eas build -p ios --profile production
npx eas build -p android --profile production
```

## CI/CD (GitHub Actions)

- CI (.github/workflows/ci.yml) builds/lints/tests
- Add deploy workflow on tags: build+push ECR, update ECS; S3+CloudFront for web; EAS build trigger

## Observability & Security

- CloudWatch Logs, alarms for ALB 5xx, ECS restarts, RDS metrics
- WAF in front of CloudFront/ALB
- Secrets in Secrets Manager; least-privilege IAM

## Staging

- Mirror prod infra in separate account or env; `*.staging` DNS; promote via tags

## Checklist

- [ ] Env files
- [ ] Postgres running
- [ ] Services up
- [ ] Frontend up
- [ ] Mobile up (API URL set)
- [ ] CI green
- [ ] ECR images pushed
- [ ] ECS services updated
- [ ] S3 + CloudFront deployed
- [ ] Mobile builds uploaded
