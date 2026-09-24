const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const AppError = require('../../utils/appError');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.login(email, password);
      
      return successResponse(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
      if (!refreshToken) {
        throw new AppError('Refresh token required', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return successResponse(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = req.user;
      return successResponse(res, { user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
