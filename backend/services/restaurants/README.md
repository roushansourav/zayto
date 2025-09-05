# Restaurants Service

For detailed local dev and deployment instructions, see `../../../docs/LOCAL_DEV_AND_DEPLOYMENT.md`.

The Restaurants microservice for the Zayto platform. This service handles all restaurant-related operations including restaurant data, menus, and basic restaurant information.

## Features

- Restaurant CRUD operations
- Menu management
- Restaurant search and filtering
- Restaurant details and information
- Database integration with PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

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
docker build -t zayto-restaurants-service .
docker run -p 3001:3001 zayto-restaurants-service
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /restaurants`: Get all restaurants
- `GET /restaurants/:id`: Get restaurant by ID
- `POST /restaurants`: Create new restaurant
- `PUT /restaurants/:id`: Update restaurant
- `DELETE /restaurants/:id`: Delete restaurant
- `GET /restaurants/:id/menu`: Get restaurant menu
- `POST /restaurants/:id/menu`: Add menu item

## Database Schema

### Restaurants Table
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- address (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- cuisine_type (VARCHAR)
- rating (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Menu Items Table
- id (UUID, Primary Key)
- restaurant_id (UUID, Foreign Key)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- category (VARCHAR)
- available (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Architecture

This service is part of the Zayto microservices architecture and communicates with:
- API Gateway (receives requests)
- PostgreSQL Database (data persistence)

## API Docs

- OpenAPI spec: `./openapi.yaml`

View with an OpenAPI viewer or serve via Swagger UI.

## Testing

Run tests locally:

```
npm install
npm test
```

Notes:
- In test mode (`NODE_ENV=test`) the HTTP server is not started; Express app is exported for Supertest.
- Tests do not require a running database; DB errors are tolerated in tests.


