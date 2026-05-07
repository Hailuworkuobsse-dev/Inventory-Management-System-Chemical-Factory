const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// POST /api/v1/auth/login - User login
router.post(
  '/login',
  validate(authController.loginSchema),
  authController.login.bind(authController)
);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken.bind(authController));

// POST /api/v1/auth/logout - Logout user (requires auth to invalidate token)
router.post('/logout', authMiddleware, authController.logout.bind(authController));

// POST /api/v1/auth/change-password - Change password (requires auth)
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

module.exports = router;
