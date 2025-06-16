const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'testsecret';
const app = require('../src/index');

jest.mock('../src/services/saleService');
const saleService = require('../src/services/saleService');

saleService.createCheckoutSession.mockResolvedValue({ url: 'http://stripe' });
saleService.getClubSalesHistory.mockResolvedValue([]);
saleService.getScoutRevenueHistory.mockResolvedValue([]);
saleService.handleWebhook.mockResolvedValue({});

const token = jwt.sign({ id: 2 }, 'testsecret');

describe('Sales routes', () => {
  test('checkout', async () => {
    const res = await request(app)
      .post('/api/sales/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ reportId: 1 });
    expect(res.statusCode).toBe(200);
  });

  test('history for club', async () => {
    const res = await request(app)
      .get('/api/sales/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('history for scout', async () => {
    const res = await request(app)
      .get('/api/sales/scout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('webhook', async () => {
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send({});
    expect(res.statusCode).toBeLessThan(500);
  });
});
