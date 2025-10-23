const request = require('supertest');
const app = require('../server'); // We'll need to export app from server.js

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@test.com`,
          password: 'password123',
          phone: '+1234567890'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toContain('test');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@test.com'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const email = `login${Date.now()}@test.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: email,
          password: 'password123',
          phone: '+1234567890'
        });

      // Then login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: email,
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
});