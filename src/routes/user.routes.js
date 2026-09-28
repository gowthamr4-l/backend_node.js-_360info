const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Define routes for /users
router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser);

module.exports = router;
