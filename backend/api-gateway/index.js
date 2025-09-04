const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 8080;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

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
      'auth-otp-verify': '/api/users/auth/otp/verify'
    }
  });
});

// Proxy middleware configuration
const restaurantsProxy = createProxyMiddleware({
  target: 'http://restaurants-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      message: 'The restaurants service is currently unavailable'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.path} to restaurants service`);
  }
});

// Proxy requests to the restaurants service under /api/restaurants
app.use('/api/restaurants', restaurantsProxy);

// Users proxy
const usersProxy = createProxyMiddleware({
  target: 'http://users-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
});

app.use('/api/users', usersProxy);

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


