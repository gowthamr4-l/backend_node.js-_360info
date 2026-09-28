const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /users
 * @desc Get all users
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.status(200).json({ success: true, data: users });
});

/**
 * @route GET /users/:id
 * @desc Get a single user by ID
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @route POST /users
 * @desc Create a new user
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

module.exports = {
  getUsers,
  getUser,
  createUser
};
