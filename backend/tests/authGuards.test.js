const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canRegisterRole } = require('../utils/authGuards');

describe('authGuards', () => {
  it('allows only self-service account roles', () => {
    assert.equal(canRegisterRole('Buyer'), true);
    assert.equal(canRegisterRole('Farmer'), true);
    assert.equal(canRegisterRole('Student'), true);
    assert.equal(canRegisterRole('Admin'), false);
    assert.equal(canRegisterRole('Representative'), false);
  });
});
