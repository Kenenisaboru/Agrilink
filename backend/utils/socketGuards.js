/**
 * Pure authorization helpers for Socket.io handlers (unit-testable).
 */

function assertSenderMatchesSocket(socketUserId, clientSenderId) {
  if (!clientSenderId || clientSenderId !== socketUserId) {
    return { ok: false, error: 'Sender mismatch' };
  }
  return { ok: true };
}

function canJoinTrackingRoom(order, userId, role) {
  if (!order) return false;
  const uid = userId.toString();
  if (role === 'Admin') return true;
  const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
  const farmerId = order.farmer?._id?.toString() || order.farmer?.toString();
  return uid === buyerId || uid === farmerId;
}

function canShareLocation(order, userId, role) {
  if (!order) return false;
  if (role === 'Admin') return true;
  const farmerId = order.farmer?._id?.toString() || order.farmer?.toString();
  return userId.toString() === farmerId;
}

module.exports = {
  assertSenderMatchesSocket,
  canJoinTrackingRoom,
  canShareLocation,
};
