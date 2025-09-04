const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('..');

describe('Users Service - Phone OTP', () => {
  const phone = '+15550001111';

  it('should request OTP with a code in non-production', async () => {
    const res = await request(app).post('/auth/otp/request').send({ phone });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe(phone);
    // in non-production a code is returned for test
    expect(typeof res.body.data.code === 'string').toBe(true);
  });

  it('should verify OTP and return a token', async () => {
    const reqRes = await request(app).post('/auth/otp/request').send({ phone });
    const code = reqRes.body?.data?.code;
    expect(code).toBeTruthy();

    const verifyRes = await request(app).post('/auth/otp/verify').send({ phone, code });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(typeof verifyRes.body.data.token === 'string').toBe(true);
  });

  it('should reject invalid/expired code', async () => {
    const res = await request(app).post('/auth/otp/verify').send({ phone, code: '000000' });
    expect([400, 401]).toContain(res.status);
  });
});


