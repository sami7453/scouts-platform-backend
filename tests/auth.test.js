const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'testsecret';
const app = require('../src/index');

jest.mock('../src/services/authService');
const authService = require('../src/services/authService');

authService.register.mockResolvedValue({ user: { id: 1 } });
authService.login.mockResolvedValue({ token: 'abc' });
authService.getProfile.mockResolvedValue({ id: 1, email: 'a@b.c' });

describe('Auth routes', () => {
  test('register scout', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.c', password: '123456', role: 'scout' });
    expect(res.statusCode).toBe(201);
  });

  test('login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.c', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('abc');
  });

  test('profile', async () => {
    const token = jwt.sign({ id: 1 }, 'testsecret');
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
