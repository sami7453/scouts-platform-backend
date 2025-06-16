const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'testsecret';
const app = require('../src/index');

jest.mock('../src/services/scoutService');
jest.mock('../src/services/clubService');
const scoutService = require('../src/services/scoutService');
const clubService = require('../src/services/clubService');

scoutService.updateProfile.mockResolvedValue({ ok: true });
scoutService.getProfile.mockResolvedValue({ user: { id: 1 }, scout: {} });
clubService.updateProfile.mockResolvedValue({ ok: true });
clubService.getProfile.mockResolvedValue({ user: { id: 2 }, club: {} });

const scoutToken = jwt.sign({ id: 1 }, 'testsecret');
const clubToken = jwt.sign({ id: 2 }, 'testsecret');

describe('Profile routes', () => {
  test('update scout profile', async () => {
    const res = await request(app)
      .patch('/api/scouts/profile')
      .set('Authorization', `Bearer ${scoutToken}`)
      .send({ bio: 'Hi' });
    expect(res.statusCode).toBe(200);
  });

  test('get scout full profile', async () => {
    const res = await request(app)
      .get('/api/scouts/profile/full')
      .set('Authorization', `Bearer ${scoutToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('update club profile', async () => {
    const res = await request(app)
      .patch('/api/clubs/profile')
      .set('Authorization', `Bearer ${clubToken}`)
      .send({ bio: 'club' });
    expect(res.statusCode).toBe(200);
  });

  test('get club full profile', async () => {
    const res = await request(app)
      .get('/api/clubs/profile/full')
      .set('Authorization', `Bearer ${clubToken}`);
    expect(res.statusCode).toBe(200);
  });
});
