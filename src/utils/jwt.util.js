const crypto = require('crypto');
const env = require('../config/env');

const base64UrlEncode = (str) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
};

/**
 * Sign a JWT using native crypto HMAC-SHA256
 */
const signToken = (payload, secret, expiresInSeconds = 900) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const headerEnc = base64UrlEncode(JSON.stringify(header));
  const payloadEnc = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', secret || 'default_jwt_secret_key_india_dits')
    .update(`${headerEnc}.${payloadEnc}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerEnc}.${payloadEnc}.${signature}`;
};

/**
 * Verify a JWT using native crypto HMAC-SHA256
 */
const verifyToken = (token, secret) => {
  if (!token || typeof token !== 'string') throw new Error('Invalid token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');

  const [headerEnc, payloadEnc, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret || 'default_jwt_secret_key_india_dits')
    .update(`${headerEnc}.${payloadEnc}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadEnc));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    const err = new Error('Token expired');
    err.name = 'TokenExpiredError';
    throw err;
  }

  return payload;
};

/**
 * Generate a short-lived access token (default: 15 minutes = 900s)
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    mobile: user.mobile ? user.mobile.toString() : null,
    email: user.email || null,
    name: user.name || null,
    isRealEstateAgent: Boolean(user.isRealEstateAgent),
    type: 'ACCESS_TOKEN',
  };

  return signToken(payload, env.JWT_SECRET, 15 * 60);
};

/**
 * Generate a long-lived refresh token (default: 7 days = 604800s)
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'REFRESH_TOKEN',
  };

  return signToken(payload, env.JWT_REFRESH_SECRET, 7 * 24 * 60 * 60);
};

const verifyAccessToken = (token) => {
  return verifyToken(token, env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return verifyToken(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
