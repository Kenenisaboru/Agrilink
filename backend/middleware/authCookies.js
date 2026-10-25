const AUTH_COOKIE = 'agrilink_session';

const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
};

const clearAuthCookie = (res) => {
  const { maxAge, ...options } = authCookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
};

const getAuthCookie = (cookieHeader = '') => {
  const authCookie = cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${AUTH_COOKIE}=`));
  return authCookie ? authCookie.slice(AUTH_COOKIE.length + 1) : null;
};

module.exports = { setAuthCookie, clearAuthCookie, getAuthCookie };
