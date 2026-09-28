const authService = require('../services/auth.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Legacy mobile check handler (kept for backwards compatibility)
 */
exports.verifyMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, error: 'Mobile number is required' });
    }

    const cleanMobile = mobile.toString().replace(/[^0-9]/g, '');
    const user = await prisma.user.findUnique({
      where: { mobile: BigInt(cleanMobile) },
    });

    if (user) {
      return res.status(200).json({ success: true, exists: true, user: authService.serializeUser(user) });
    } else {
      return res.status(200).json({ success: true, exists: false });
    }
  } catch (error) {
    console.error('Verify mobile error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    // Set refresh token in HttpOnly cookie
    if (res.cookie) {
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

/**
 * User login
 */
exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    // Set refresh token in HttpOnly cookie
    if (res.cookie) {
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'NO_REFRESH_TOKEN',
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshUserToken(token);

    if (res.cookie) {
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      error: 'REFRESH_FAILED',
      message: error.message || 'Failed to refresh session',
    });
  }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    if (userId) {
      await authService.logoutUser(userId);
    }

    if (res.clearCookie) {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'LOGOUT_ERROR',
      message: 'Failed to logout',
    });
  }
};

/**
 * Get current authenticated user profile
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await authService.getUserProfile(userId);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(404).json({
      success: false,
      error: error.message || 'User not found',
    });
  }
};
