const saleService = require('../src/services/saleService');

jest.mock('../src/models/saleModel');
jest.mock('../src/models/payoutModel');
jest.mock('../src/models/reportModel');
jest.mock('../src/db');

const saleModel = require('../src/models/saleModel');
const payoutModel = require('../src/models/payoutModel');
const reportModel = require('../src/models/reportModel');
const db = require('../src/db');

const client = { query: jest.fn(), release: jest.fn() };

db.getClient.mockResolvedValue(client);

saleModel.insertSale.mockResolvedValue({ id: 1 });
reportModel.getReportById.mockResolvedValue({ scout_id: 3 });
payoutModel.insertPayout.mockResolvedValue({});

const event = {
  type: 'checkout.session.completed',
  data: {
    object: {
      metadata: { reportId: '1', clubId: '2', amount_cents: '1000', commission_cents: '100' },
      payment_intent: 'pi_123',
    },
  },
};

test('handleWebhook inserts sale and payout', async () => {
  await saleService.handleWebhook(event);
  expect(db.getClient).toHaveBeenCalled();
  expect(saleModel.insertSale).toHaveBeenCalledWith(expect.objectContaining({
    report_id: 1,
    club_id: 2,
    amount_cents: 1000,
    commission_cents: 100,
    payment_intent: 'pi_123',
  }), client);
  expect(payoutModel.insertPayout).toHaveBeenCalledWith(expect.objectContaining({
    sale_id: 1,
    scout_id: 3,
    amount_cents: 900,
    payout_id: 'pi_123',
  }), client);
});
