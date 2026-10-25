const REGISTRABLE_ROLES = new Set(['Farmer', 'Student', 'Buyer']);

const canRegisterRole = (role) => REGISTRABLE_ROLES.has(role);

module.exports = { canRegisterRole };
