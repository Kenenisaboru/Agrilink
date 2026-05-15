const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canViewOrder, canUpdateOrderStatus } = require('../utils/orderGuards');

describe('orderGuards', () => {
  const order = { buyer: 'buyer-1', farmer: 'farmer-1' };

  it('allows buyer and farmer to view order', () => {
    assert.equal(canViewOrder(order, 'buyer-1', 'Buyer'), true);
    assert.equal(canViewOrder(order, 'farmer-1', 'Farmer'), true);
    assert.equal(canViewOrder(order, 'other', 'Buyer'), false);
  });

  it('allows admin to view any order', () => {
    assert.equal(canViewOrder(order, 'admin', 'Admin'), true);
  });

  it('only allows farmer or admin to update status', () => {
    assert.equal(canUpdateOrderStatus(order, 'farmer-1', 'Farmer'), true);
    assert.equal(canUpdateOrderStatus(order, 'buyer-1', 'Buyer'), false);
    assert.equal(canUpdateOrderStatus(order, 'admin', 'Admin'), true);
  });
});
