const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');
const config = require('../../config');

/**
 * Auth Service
 * Handles authentication logic including login, token management, and password operations
 */
class AuthService {
  /**
   * Authenticate user and generate tokens
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Access token, refresh token, and user info
   */
  async login(email, password) {
    // Find user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePerms: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        warehouseScope: true,
      },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      id: user.id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles.map(ur => ur.role.name),
      warehouseScope: user.warehouseScope?.map(w => w.id) || [],
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object>} - New access token
   */
  async refreshToken(token) {
    // Find refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenRecord) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Check if token is expired
    if (refreshTokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      throw AppError.unauthorized('Refresh token expired');
    }

    // Check if user is still active
    if (!refreshTokenRecord.user.isActive) {
      throw AppError.unauthorized('User account is inactive');
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });

    // Generate new access token
    const accessToken = this.generateAccessToken(refreshTokenRecord.user.id);

    // Generate new refresh token
    const newRefreshToken = await this.generateRefreshToken(refreshTokenRecord.user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by invalidating refresh token
   * @param {string} token - Refresh token to invalidate
   */
  async logout(token) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Generate JWT access token
   * @private
   */
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRY }
    );
  }

  /**
   * Generate and store refresh token
   * @private
   */
  async generateRefreshToken(userId) {
    const token = jwt.sign(
      { userId, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRY }
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(config.JWT_REFRESH_EXPIRY));

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

module.exports = new AuthService();
