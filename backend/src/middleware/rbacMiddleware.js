const AppError = require('../utils/appError');
const prisma = require('../utils/prisma');

/**
 * RBAC Middleware - checks if user has required permission
 * @param {string} resource - Resource name (e.g., 'INVENTORY', 'BATCH')
 * @param {string} action - Action name (e.g., 'CREATE', 'READ', 'UPDATE', 'DELETE')
 */
const rbacMiddleware = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get user's permissions through roles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  rolePerms: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!userWithRoles) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      // Collect all permissions
      const permissions = new Set();
      userWithRoles.roles.forEach(ur => {
        ur.role.rolePerms.forEach(rp => {
          permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
        });
      });

      // Check if user has required permission
      const requiredPermission = `${resource}:${action}`;
      const hasPermission = permissions.has(requiredPermission);

      // Admin bypass
      const isAdmin = userWithRoles.roles.some(ur => ur.role.name === 'ADMIN');

      if (!hasPermission && !isAdmin) {
        throw new AppError(
          `Forbidden - Missing permission: ${requiredPermission}`,
          403,
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = rbacMiddleware;
