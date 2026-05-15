const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canVerifyPayment } = require('../utils/paymentGuards');

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
});
