const prisma = require('../config/db');

// Helper to serialize BigInt for JSON responses
const serializeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    mobile: user.mobile ? user.mobile.toString() : null
  };
};

/**
 * Get all users from the database.
 * @returns {Promise<Array>} List of users
 */
const getAllUsers = async (query = {}) => {
  let where = {};
  if (query.mobile) {
    where.mobile = BigInt(query.mobile);
  }
  if (query.countryCode) {
    where.countryCode = query.countryCode;
  }
  const users = await prisma.user.findMany({ where });
  return users.map(serializeUser);
};

/**
 * Get a user by ID.
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) }
  });
};

/**
 * Create a new user.
 * @param {Object} data - User data (email, name)
 * @returns {Promise<Object>} Created user object
 */
const createUser = async (data) => {
  if (data.mobile) {
    data.mobile = BigInt(data.mobile);
  }
  try {
    const user = await prisma.user.create({
      data
    });
    return serializeUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta && error.meta.target;
      if (target && target.includes('email')) {
        throw new Error('This email address is already in use. Please try another one.');
      }
      if (target && target.includes('mobile')) {
        throw new Error('This mobile number is already in use. Please try another one.');
      }
      throw new Error('An account with this information already exists.');
    }
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};
