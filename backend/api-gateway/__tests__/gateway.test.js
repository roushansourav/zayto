const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('..');

describe('API Gateway', () => {
  it('GET /health should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET / should list endpoints', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.endpoints).toBeDefined();
  });
});


