# Zayto - Code Generation & Development Guidelines (Microservices)

This document outlines the core principles for the distributed architecture of the Zayto project.

## 1. System Architecture

- **Microservices:** The backend is composed of small, independent services, each responsible for a specific business domain (e.g., Users, Restaurants, Orders). Each service will have its own API.
- **Microfrontends:** The frontend is composed of independent applications that are composed in a browser. We will use Module Federation with Next.js.
- **API Gateway:** A single entry point for all frontend requests. It will route traffic to the appropriate downstream microservice. This is also where cross-cutting concerns like authentication and rate limiting will be handled.
- **Communication:** Services will communicate via synchronous RESTful APIs for queries and potentially asynchronous events for commands or inter-service communication.

## 2. Containerization & Orchestration

- **Docker:** Every microservice and microfrontend will be containerized using a `Dockerfile`. This ensures consistency across development, testing, and production environments.
- **Docker Compose:** For local development, a `docker-compose.yml` file will be used to spin up the entire stack, including all services and the PostgreSQL database.
- **Kubernetes (k8s):** The production environment will be orchestrated by Kubernetes. Each service will have its own set of manifest files (Deployment, Service, Ingress).

## 3. CI/CD

- A CI/CD pipeline (e.g., using GitHub Actions) will be established to automate testing, image building, and deployment to the Kubernetes cluster.

## 4. Code Principles

- **Clean Architecture:** Within each microservice, a layered architecture (Controller -> Service -> Repository) should still be used.
- **Separation of Concerns:** This is now enforced at the service and application boundary.
- **DRY:** Principles apply within each service. Avoid duplicating logic across services where possible; consider a shared library if necessary, but prefer independence.
- **i18n:** The microfrontend shell application is responsible for the i18n context, which can be passed down to other microfrontends.