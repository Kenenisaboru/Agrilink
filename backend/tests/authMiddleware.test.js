const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { authorize } = require('../middleware/authMiddleware');

describe('authorize middleware', () => {
  it('calls next when role is allowed', () => {
    const middleware = authorize('Farmer', 'Admin');
    let called = false;
    const req = { user: { role: 'Farmer' } };
    const res = { status: () => ({ json: () => {} }) };
    middleware(req, res, () => {
      called = true;
    });
    assert.equal(called, true);
  });

  it('returns 403 when role is not allowed', () => {
    const middleware = authorize('Representative');
    let statusCode;
    const req = { user: { role: 'Buyer' } };
    const res = {
      status(code) {
        statusCode = code;
        return { json: () => {} };
      },
    };
    let nextCalled = false;
    middleware(req, res, () => {
      nextCalled = true;
    });
    assert.equal(statusCode, 403);
    assert.equal(nextCalled, false);
  });
});
