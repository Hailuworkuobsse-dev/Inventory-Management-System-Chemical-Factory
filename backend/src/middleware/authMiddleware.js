const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const AppError = require('../utils/appError');
const config = require('../config');

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or inactive');
    }

    // Attach user and permissions to request
    req.user = {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.rolePerms.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
      ),
      warehouseScope: user.warehouseScope?.map(w => w.id) || [],
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired'));
    }
    next(error);
  }
};

module.exports = authMiddleware;
