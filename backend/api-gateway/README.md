# API Gateway

For full local development and production deployment instructions, see `../../docs/LOCAL_DEV_AND_DEPLOYMENT.md`.

The API Gateway service for the Zayto microservices architecture. This service acts as the single entry point for all client requests and handles routing, authentication, and request/response transformation.

## Features

- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting
- Request/response transformation
- Error handling and logging

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## Docker

```bash
docker build -t zayto-api-gateway .
docker run -p 3000:3000 zayto-api-gateway
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /api/restaurants`: Route to restaurants service
- `GET /api/users`: Route to users service
- `GET /api/reviews`: Route to reviews service

## Architecture

This service is part of the Zayto microservices architecture and communicates with:
- Restaurants Service
- Users Service
- Reviews Service
- Partner Service

## API Docs

- OpenAPI spec: `./openapi.yaml`

You can view the spec using any OpenAPI viewer (e.g., VS Code OpenAPI extension) or serve it via Swagger UI.

## Testing

Run unit/integration tests locally:

```
npm install
npm test
```

Notes:
- The app exports the Express instance and does not start the HTTP server when `NODE_ENV=test`.


