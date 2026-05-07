const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const validate = require('../../middleware/validate');

// Validation schemas (using simple validation for now - can be replaced with Joi/Zod)
const loginSchema = async (data) => {
  const errors = [];
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ message: 'Email is required', path: ['email'] });
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push({ message: 'Invalid email format', path: ['email'] });
  }
  
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ message: 'Password is required', path: ['password'] });
  } else if (data.password.length < 6) {
    errors.push({ message: 'Password must be at least 6 characters', path: ['password'] });
  }
  
  return {
    error: errors.length > 0 ? { details: errors } : null,
    value: { email: data.email?.toLowerCase(), password: data.password },
  };
};

const refreshTokenSchema = async (data) => {
  if (!data.refreshToken) {
    return {
      error: { details: [{ message: 'Refresh token is required', path: ['refreshToken'] }] },
      value: {},
    };
  }
  return { error: null, value: { refreshToken: data.refreshToken } };
};

/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */
class AuthController {
  /**
   * POST /api/v1/auth/login
   * User login endpoint
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody || req.body;
      
      const result = await authService.login(email, password);
      
      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return access token and user info (exclude refresh token from body)
      return successResponse(res, {
        accessToken: result.accessToken,
        user: result.user,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  async refreshToken(req, res, next) {
    try {
      // Get refresh token from cookie or body
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (!token) {
        return errorResponse(res, 'Refresh token is required', 'MISSING_TOKEN', 400);
      }

      const result = await authService.refreshToken(token);
      
      // Set new refresh token in cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, {
        accessToken: result.accessToken,
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user and invalidate refresh token
   */
  async logout(req, res, next) {
    try {
      // Get refresh token from cookie
      const token = req.cookies?.refreshToken;
      
      if (token) {
        await authService.logout(token);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   * Change user password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current password and new password are required', 'MISSING_FIELDS', 400);
      }

      if (newPassword.length < 6) {
        return errorResponse(res, 'New password must be at least 6 characters', 'WEAK_PASSWORD', 400);
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      return successResponse(res, null, 'Password changed successfully. Please login again.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
module.exports.loginSchema = loginSchema;
module.exports.refreshTokenSchema = refreshTokenSchema;
