const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'kudos_access_secret_fallback_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'kudos_refresh_secret_fallback_2026';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate pair of access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    department: user.department,
    name: user.name
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Standard cookie configuration for access & refresh tokens
 */
const getCookieOptions = (isRefresh = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: isRefresh 
      ? 7 * 24 * 60 * 60 * 1000 // 7 days in ms
      : 15 * 60 * 1000           // 15 mins in ms
  };
};

/**
 * Attach auth cookies to response
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, getCookieOptions(false));
  res.cookie('refreshToken', refreshToken, getCookieOptions(true));
};

/**
 * Clear auth cookies from response
 */
const clearAuthCookies = (res) => {
  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  };
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getCookieOptions
};
