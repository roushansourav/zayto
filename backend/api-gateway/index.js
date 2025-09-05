const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// IMPORTANT: Do not parse JSON globally before proxies.
// Some proxy targets expect to receive the raw request stream.
// If we need JSON parsing for local (non-proxied) routes in future,
// mount it only on those specific routes.

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Gateway info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Zayto API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      restaurants: '/api/restaurants',
      'restaurant-details': '/api/restaurants/:id',
      'restaurant-menu': '/api/restaurants/:id/menu',
      'restaurant-reviews': '/api/restaurants/:id/reviews',
      'users-health': '/api/users/health',
      'auth-google': '/api/users/auth/google',
      'auth-apple': '/api/users/auth/apple',
      'auth-otp-request': '/api/users/auth/otp/request',
      'auth-otp-verify': '/api/users/auth/otp/verify',
      'reviews': '/api/reviews',
      'partner': '/api/partner',
      'partner-orders': '/api/partner/orders',
      'orders': '/api/orders'
    }
  });
});

// Configurable targets for local dev
const TARGETS = {
  RESTAURANTS: process.env.RESTAURANTS_URL || 'http://restaurants-service:3001',
  USERS: process.env.USERS_URL || 'http://users-service:3003',
  REVIEWS: process.env.REVIEWS_URL || 'http://reviews-service:3004',
  PARTNER: process.env.PARTNER_URL || 'http://partner-service:3005',
  ORDERS: process.env.ORDERS_URL || 'http://orders-service:3006',
  NOTIFICATIONS: process.env.NOTIFICATIONS_URL || 'http://notifications-service:3007'
};

// Proxy restaurants: /api/restaurants -> restaurants-service /restaurants
app.use(
  '/api/restaurants',
  createProxyMiddleware({
    target: TARGETS.RESTAURANTS,
    changeOrigin: true,
    pathRewrite: (path, req) => '/restaurants'
  })
);

// Users proxy: /api/users/* -> users-service /*
app.use(
  '/api/users',
  createProxyMiddleware({
    target: TARGETS.USERS,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' }
  })
);

// Reviews proxy: /api/reviews/* -> reviews-service /*
app.use(
  '/api/reviews',
  createProxyMiddleware({
    target: TARGETS.REVIEWS,
    changeOrigin: true,
    pathRewrite: (path) => '/reviews' + (path && path !== '/' ? path : '')
  })
);

// Partner proxy: /api/partner/* -> partner-service /*
app.use(
  '/api/partner',
  createProxyMiddleware({
    target: TARGETS.PARTNER,
    changeOrigin: true,
    pathRewrite: { '^/api/partner': '' }
  })
);

// Orders proxy: /api/partner/orders/* -> orders-service /*
app.use(
  '/api/partner/orders',
  createProxyMiddleware({
    target: TARGETS.ORDERS,
    changeOrigin: true,
    pathRewrite: { '^/api/partner': '' }
  })
);

// Orders public proxy
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: TARGETS.ORDERS,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  })
);

// Notifications proxy
app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: TARGETS.NOTIFICATIONS,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  })
);

// 404 handler for unmatched routes (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/health',
      '/api/restaurants',
      '/api/restaurants/:id',
      '/api/restaurants/:id/menu',
      '/api/restaurants/:id/reviews'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
    console.log(`Restaurants API available at: http://localhost:${port}/api/restaurants`);
  });
}

module.exports = app;


