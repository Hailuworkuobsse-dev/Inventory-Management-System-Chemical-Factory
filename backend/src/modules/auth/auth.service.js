const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');

class AuthService {
  async login(email, password) {
    // Find user with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      accessToken,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map(ur => ur.role.name)
      }
    };
  }

  async refreshToken(refreshToken) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    // Check if token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or invalid', 401, 'UNAUTHORIZED');
    }

    // Delete old token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new access token
    const accessToken = this.generateAccessToken(decoded.userId);

    return { accessToken };
  }

  async logout(refreshToken) {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    return { message: 'Logged out successfully' };
  }

  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
