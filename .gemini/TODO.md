# Zayto Project TODO List (Microservices Architecture)

## Phase 1: Foundation & Core Discovery (MVP)

**Goal:** Set up the complete distributed architecture and build the first vertical slice: discovering restaurants.

- [x] **System Architecture & DevOps**
  - [x] Create `docker-compose.yml` for local development (API Gateway, `restaurants-service`, PostgreSQL).
  - [x] **API Gateway:**
    - [x] Choose and configure an API Gateway (e.g., custom Node.js/Express, or a managed one like Kong/Traefik).
  - [x] **CI/CD:**
    - [x] Set up a basic CI/CD pipeline structure (e.g., `.github/workflows`) for automated testing and building.
  - [x] **Database:**
    - [x] Configure PostgreSQL service in `docker-compose.yml`.

- [x] **Backend (`restaurants-service`)**
  - [x] Create a new directory for the service (`services/restaurants`).
  - [x] Initialize a new Node.js/Express project.
  - [x] Create a `Dockerfile` for this service.
  - [x] Implement database connection to the Dockerized PostgreSQL.
  - [x] Create schema for `Restaurants`, `MenuItems`, `Reviews`.
  - [x] Implement API endpoints (`GET /restaurants`, `GET /restaurants/:id`).
  - [ ] Create Kubernetes manifests (`deployment.yaml`, `service.yaml`).

- [x] **Frontend (Host Shell & `discovery` Microfrontend)**
  - [x] Configure the existing Next.js app as the "host" shell.
  - [x] Set up Module Federation.
  - [x] Create the first microfrontend for "discovery" (browsing/searching restaurants).
  - [x] The host shell will be responsible for the main layout, navbar, and i18n context.
  - [x] The discovery microfrontend will contain the search bar and restaurant list components.
  - [x] Connect the frontend to the API Gateway to fetch restaurant data.

## Phase 2: Users & Engagement

- [x] **Backend (`users-service`)**
  - [x] Create a new `users-service` for authentication and user profiles.
  - [x] Dockerize and add to `docker-compose.yml`.
  - [x] Implement `register`, `login`, and profile management endpoints.
  - [x] Add OAuth login: Google and Apple ID (token verification, user linking).
  - [x] Add phone number login with OTP (request/verify) using a provider (e.g., Twilio).
  - [x] Issue and validate JWT access/refresh tokens; session management.
- [ ] **Backend (`reviews-service`)**
  - [ ] Create a new `reviews-service` to manage reviews.
  - [ ] Implement endpoints to create and list reviews.
- [ ] **Frontend**
  - [ ] Create a `profile` microfrontend for user profiles and order history.
  - [ ] Create a `reviews` microfrontend for submitting and viewing reviews.
  - [ ] Add authentication UI flows: Google, Apple ID, and phone OTP login.
  - [ ] Persist auth state in the host app and secure API calls.

## Phase 3: Restaurant Partner Platform

- [ ] **Backend (`partner-service`)**
  - [ ] Create a new `partner-service` for restaurant owners.
  - [ ] Implement endpoints for profile, menu, and order management.
- [ ] **Frontend**
  - [ ] Create a new host application for the Partner Platform (`partner.zayto.com`).
  - [ ] Create microfrontends for `partner-profile`, `partner-menu`, and `partner-orders`.

## Phase 4 & 5: Promotions, Admin & Advanced Features

- [ ] **Backend (`promotions-service`, `admin-service`)**
  - [ ] Design and create services for managing coupons and admin-level tasks.
- [ ] **Frontend**
  - [ ] Create host applications and microfrontends for the Admin panel.