function canViewOrder(order, userId, role) {
  if (!order) return false;
  if (role === 'Admin') return true;
  const uid = userId.toString();
  const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
  const farmerId = order.farmer?._id?.toString() || order.farmer?.toString();
  return uid === buyerId || uid === farmerId;
}

function canUpdateOrderStatus(order, userId, role) {
  if (!order) return false;
  if (role === 'Admin') return true;
  return order.farmer?.toString() === userId.toString();
}

module.exports = { canViewOrder, canUpdateOrderStatus };
