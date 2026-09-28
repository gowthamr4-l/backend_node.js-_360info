const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.util');

/**
 * Native secure password hashing with salt using node:crypto
 */
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Native secure password verification
 */
const comparePassword = async (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

/**
 * Helper to convert BigInt and strip sensitive properties from User object
 */
const serializeUser = (user) => {
  if (!user) return null;
  const { password, refreshToken, ...safeUser } = user;
  return {
    ...safeUser,
    id: safeUser.id,
    mobile: safeUser.mobile ? safeUser.mobile.toString() : null,
  };
};

/**
 * Register a new user
 */
const registerUser = async (data) => {
  const { mobile, name, email, countryCode = '+91', isRealEstateAgent = false, password } = data;

  if (!mobile || !name) {
    throw new Error('Mobile number and Name are required for registration.');
  }

  const cleanMobile = mobile.toString().replace(/[^0-9]/g, '');
  if (!/^\d{10}$/.test(cleanMobile)) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  // Check if user with mobile already exists
  const existingUser = await prisma.user.findUnique({
    where: { mobile: BigInt(cleanMobile) },
  });

  if (existingUser) {
    throw new Error('A user with this mobile number already exists. Please log in.');
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new Error('A user with this email address already exists.');
    }
  }

  let hashedPassword = null;
  if (password && password.trim().length > 0) {
    hashedPassword = await hashPassword(password.trim());
  }

  const newUser = await prisma.user.create({
    data: {
      mobile: BigInt(cleanMobile),
      countryCode: countryCode || '+91',
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      isRealEstateAgent: Boolean(isRealEstateAgent),
      password: hashedPassword,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  // Store refresh token in DB for revocation tracking
  await prisma.user.update({
    where: { id: newUser.id },
    data: { refreshToken },
  });

  return {
    user: serializeUser(newUser),
    accessToken,
    refreshToken,
  };
};

/**
 * Login user via mobile number or email
 */
const loginUser = async (data) => {
  const { mobile, email, password } = data;

  if (!mobile && !email) {
    throw new Error('Mobile number or Email is required for login.');
  }

  let user = null;

  if (mobile) {
    const cleanMobile = mobile.toString().replace(/[^0-9]/g, '');
    user = await prisma.user.findUnique({
      where: { mobile: BigInt(cleanMobile) },
    });
  } else if (email) {
    user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  if (!user) {
    throw new Error('User not found. Please check your credentials or register.');
  }

  // If password was provided or user has password set
  if (password && user.password) {
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password. Please try again.');
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token and rotate refresh token
 */
const refreshUserToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new Error('Refresh token is required.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    throw new Error('Invalid or expired refresh token. Please log in again.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || !user.refreshToken) {
    throw new Error('User session not found. Please log in again.');
  }

  // Verify that the stored refresh token matches the provided one (prevents replay / revoked tokens)
  if (user.refreshToken !== oldRefreshToken) {
    // Potential token reuse detected - clear token for security
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new Error('Token reuse detected or token revoked. Please log in again.');
  }

  // Issue new rotated tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Update DB with rotated refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    user: serializeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user by clearing stored refresh token
 */
const logoutUser = async (userId) => {
  if (!userId) return;

  await prisma.user.update({
    where: { id: Number(userId) },
    data: { refreshToken: null },
  });

  return { success: true };
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  return serializeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getUserProfile,
  serializeUser,
};
