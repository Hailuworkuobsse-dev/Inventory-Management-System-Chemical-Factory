const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { loginSchema } = require('./auth.validation');
const authMiddleware = require('../../middleware/authMiddleware');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const AppError = require('../../utils/appError');

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email, password } = value;
    const result = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400, 'BAD_REQUEST');
    }

    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/change-password
router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
