const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');

// Public auth routes
router.post('/verify-mobile', authController.verifyMobile);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Logout (can accept auth header or cookies)
router.post('/logout', optionalAuth, authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
