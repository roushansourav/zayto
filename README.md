# Zayto - Microservices Architecture Platform

Zayto is a comprehensive food delivery and restaurant discovery platform built with a microservices architecture. The platform consists of multiple services and microfrontends that work together to provide a seamless user experience.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Host App      │    │  API Gateway    │    │  Microservices  │
│  (Next.js)      │◄──►│   (Node.js)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Microfrontends  │    │   PostgreSQL    │    │   Docker Compose│
│   (Next.js)     │    │   Database      │    │   Orchestration │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Repository Structure

This monorepo contains multiple Git repositories for each service and microfrontend:

### Services
- **API Gateway** (`api-gateway/`) - Single entry point for all client requests
- **Restaurants Service** (`services/restaurants/`) - Restaurant data and menu management

### Microfrontends
- **Discovery Microfrontend** (`microfrontends/discovery/`) - Restaurant search and browsing

### Host Application
- **Main Host App** (root directory) - Next.js shell application with Module Federation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (for local development)

### Quick Start

1. **Clone and setup all repositories:**
   ```bash
   # Main host application
   git clone <host-repo-url>
   cd zayto
   
   # API Gateway
   cd api-gateway
   git clone <api-gateway-repo-url>
   
   # Restaurants Service
   cd ../services/restaurants
   git clone <restaurants-repo-url>
   
   # Discovery Microfrontend
   cd ../../microfrontends/discovery
   git clone <discovery-repo-url>
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Host App: http://localhost:3000
   - API Gateway: http://localhost:3001
   - Restaurants Service: http://localhost:3002

## Development

### Individual Service Development

Each service can be developed independently:

```bash
# API Gateway
cd api-gateway
npm install
npm run dev

# Restaurants Service
cd services/restaurants
npm install
npm run dev

# Discovery Microfrontend
cd microfrontends/discovery
npm install
npm run dev

# Host Application
npm install
npm run dev
```

### Module Federation

The microfrontends use Module Federation to integrate with the host application:

- Host app exposes shared dependencies
- Microfrontends expose their components
- Dynamic loading of microfrontend components

## Services Documentation

- [API Gateway](./api-gateway/README.md)
- [Restaurants Service](./services/restaurants/README.md)
- [Discovery Microfrontend](./microfrontends/discovery/README.md)

## Environment Variables

Create `.env` files in each service directory:

```bash
# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Restaurants Service
cp services/restaurants/.env.example services/restaurants/.env

# Discovery Microfrontend
cp microfrontends/discovery/.env.example microfrontends/discovery/.env

# Host Application
cp .env.example .env
```

## Docker

Each service includes a Dockerfile for containerization:

```bash
# Build all services
docker-compose build

# Run all services
docker-compose up

# Run individual services
docker-compose up api-gateway
docker-compose up restaurants-service
docker-compose up discovery-microfrontend
```

## Testing

```bash
# Run tests for all services
npm run test:all

# Run tests for individual services
cd api-gateway && npm test
cd services/restaurants && npm test
cd microfrontends/discovery && npm test
```

## Deployment

Each service can be deployed independently:

- **API Gateway**: Deploy to cloud provider (AWS, GCP, Azure)
- **Restaurants Service**: Deploy with database connection
- **Discovery Microfrontend**: Deploy as static assets
- **Host Application**: Deploy to Vercel, Netlify, or cloud provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
