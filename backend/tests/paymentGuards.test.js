const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canVerifyPayment, canRequestPayment, paymentMatchesOrder } = require('../utils/paymentGuards');

describe('paymentGuards', () => {
  it('allows payment owner to verify', () => {
    assert.equal(canVerifyPayment('user-1', 'user-1', 'Buyer'), true);
  });

  it('denies other buyers', () => {
    assert.equal(canVerifyPayment('user-1', 'user-2', 'Buyer'), false);
  });

  it('allows admin to verify any payment', () => {
    assert.equal(canVerifyPayment('user-1', 'user-2', 'Admin'), true);
  });

  it('only allows the buyer to pay their own unpaid pending order', () => {
    const order = { buyer: 'buyer-1', status: 'Pending', paymentStatus: 'Unpaid' };
    assert.equal(canRequestPayment(order, 'buyer-1', 'Buyer'), true);
    assert.equal(canRequestPayment(order, 'buyer-2', 'Buyer'), false);
    assert.equal(canRequestPayment(order, 'buyer-1', 'Farmer'), false);
    assert.equal(canRequestPayment({ ...order, paymentStatus: 'Paid' }, 'buyer-1', 'Buyer'), false);
  });

  it('rejects payments that do not match the buyer or order total', () => {
    const payment = { user: 'buyer-1', amount: 100 };
    const order = { buyer: 'buyer-1', totalPrice: 100 };
    assert.equal(paymentMatchesOrder(payment, order), true);
    assert.equal(paymentMatchesOrder({ ...payment, amount: 99 }, order), false);
    assert.equal(paymentMatchesOrder({ ...payment, user: 'buyer-2' }, order), false);
  });
});
