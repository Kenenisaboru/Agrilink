function canVerifyPayment(paymentUserId, requestUserId, role) {
  if (role === 'Admin') return true;
  return paymentUserId.toString() === requestUserId.toString();
}

function canRequestPayment(order, userId, role) {
  return Boolean(
    order &&
    role === 'Buyer' &&
    order.buyer.toString() === userId.toString() &&
    order.status === 'Pending' &&
    order.paymentStatus === 'Unpaid'
  );
}

function paymentMatchesOrder(payment, order) {
  return Boolean(
    payment &&
    order &&
    payment.user.toString() === order.buyer.toString() &&
    Number.isFinite(payment.amount) &&
    Number.isFinite(order.totalPrice) &&
    payment.amount > 0 &&
    Math.abs(order.totalPrice - payment.amount) < 0.01
  );
}

module.exports = { canVerifyPayment, canRequestPayment, paymentMatchesOrder };
