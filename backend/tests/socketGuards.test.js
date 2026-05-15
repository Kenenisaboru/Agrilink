const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  assertSenderMatchesSocket,
  canJoinTrackingRoom,
  canShareLocation,
} = require('../utils/socketGuards');

describe('socketGuards', () => {
  it('rejects sender mismatch', () => {
    const result = assertSenderMatchesSocket('user-a', 'user-b');
    assert.equal(result.ok, false);
  });

  it('accepts matching sender', () => {
    const result = assertSenderMatchesSocket('user-a', 'user-a');
    assert.equal(result.ok, true);
  });

  it('allows buyer and farmer to join tracking room', () => {
    const order = { buyer: 'buyer-1', farmer: 'farmer-1' };
    assert.equal(canJoinTrackingRoom(order, 'buyer-1', 'Buyer'), true);
    assert.equal(canJoinTrackingRoom(order, 'farmer-1', 'Farmer'), true);
    assert.equal(canJoinTrackingRoom(order, 'stranger', 'Buyer'), false);
    assert.equal(canJoinTrackingRoom(order, 'admin-1', 'Admin'), true);
  });

  it('only allows farmer to share location', () => {
    const order = { farmer: 'farmer-1' };
    assert.equal(canShareLocation(order, 'farmer-1', 'Farmer'), true);
    assert.equal(canShareLocation(order, 'buyer-1', 'Buyer'), false);
    assert.equal(canShareLocation(order, 'admin-1', 'Admin'), true);
  });
});
