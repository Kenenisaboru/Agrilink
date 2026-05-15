function canVerifyPayment(paymentUserId, requestUserId, role) {
  if (role === 'Admin') return true;
  return paymentUserId.toString() === requestUserId.toString();
}

module.exports = { canVerifyPayment };
