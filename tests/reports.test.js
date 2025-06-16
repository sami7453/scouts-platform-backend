const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'testsecret';
const app = require('../src/index');

jest.mock('../src/services/reportService');
const reportService = require('../src/services/reportService');

reportService.createReport.mockResolvedValue({ id: 1 });
reportService.listReports.mockResolvedValue([]);
reportService.getReport.mockResolvedValue({ id: 1 });
reportService.updateReport.mockResolvedValue({ id: 1 });
reportService.deleteReport.mockResolvedValue();

const token = jwt.sign({ id: 1 }, 'testsecret');

describe('Report routes', () => {
  test('create report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .field('player_firstname', 'a')
      .field('player_lastname', 'b')
      .field('position', 'c')
      .field('nationality', 'd')
      .field('age', '20')
      .field('current_club', 'x')
      .field('current_league', 'y')
      .field('price_cents', '1000')
      .attach('pdf', Buffer.from('test'), 'test.pdf');
    expect(res.statusCode).toBe(201);
  });

  test('get report', async () => {
    const res = await request(app)
      .get('/api/reports/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
