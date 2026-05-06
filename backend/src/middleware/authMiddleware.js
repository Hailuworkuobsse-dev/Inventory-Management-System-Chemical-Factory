const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/appError');
const prisma = require('../utils/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized - No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { roles: { include: { role: true } } }
    });

    if (!user || !user.isActive) {
      throw new AppError('Unauthorized - User not found or inactive', 401, 'UNAUTHORIZED');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map(ur => ur.role.name),
      warehouseScope: user.warehouseScope
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Unauthorized - Invalid or expired token', 401, 'UNAUTHORIZED'));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware;
