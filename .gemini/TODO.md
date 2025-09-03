# Zayto Project TODO List (Microservices Architecture)

## Phase 1: Foundation & Core Discovery (MVP)

**Goal:** Set up the complete distributed architecture and build the first vertical slice: discovering restaurants.

- [ ] **System Architecture & DevOps**
  - [ ] Create `docker-compose.yml` for local development (API Gateway, `restaurants-service`, PostgreSQL).
  - [ ] **API Gateway:**
    - [ ] Choose and configure an API Gateway (e.g., custom Node.js/Express, or a managed one like Kong/Traefik).
  - [ ] **CI/CD:**
    - [ ] Set up a basic CI/CD pipeline structure (e.g., `.github/workflows`) for automated testing and building.
  - [ ] **Database:**
    - [ ] Configure PostgreSQL service in `docker-compose.yml`.

- [ ] **Backend (`restaurants-service`)**
  - [ ] Create a new directory for the service (`services/restaurants`).
  - [ ] Initialize a new Node.js/Express project.
  - [ ] Create a `Dockerfile` for this service.
  - [ ] Implement database connection to the Dockerized PostgreSQL.
  - [ ] Create schema for `Restaurants`, `MenuItems`, `Reviews`.
  - [ ] Implement API endpoints (`GET /restaurants`, `GET /restaurants/:id`).
  - [ ] Create Kubernetes manifests (`deployment.yaml`, `service.yaml`).

- [ ] **Frontend (Host Shell & `discovery` Microfrontend)**
  - [ ] Configure the existing Next.js app as the "host" shell.
  - [ ] Set up Module Federation.
  - [ ] Create the first microfrontend for "discovery" (browsing/searching restaurants).
  - [ ] The host shell will be responsible for the main layout, navbar, and i18n context.
  - [ ] The discovery microfrontend will contain the search bar and restaurant list components.
  - [ ] Connect the frontend to the API Gateway to fetch restaurant data.

## Phase 2: Users & Engagement

- [ ] **Backend (`users-service`)**
  - [ ] Create a new `users-service` for authentication and user profiles.
  - [ ] Dockerize and add to `docker-compose.yml`.
  - [ ] Implement `register`, `login`, and profile management endpoints.
- [ ] **Backend (`reviews-service`)**
  - [ ] Create a new `reviews-service` to manage reviews.
  - [ ] Implement endpoints to create and list reviews.
- [ ] **Frontend**
  - [ ] Create a `profile` microfrontend for user profiles and order history.
  - [ ] Create a `reviews` microfrontend for submitting and viewing reviews.

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