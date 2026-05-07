const AppError = require('../utils/appError');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has the required permission
 * 
 * Usage: rbacMiddleware('INVENTORY', 'READ')
 *        rbacMiddleware('BATCH', 'RELEASE_QUARANTINE')
 */
const rbacMiddleware = (resource, action) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const requiredPermission = `${resource}:${action}`;
    
    // Check if user has ADMIN role (superuser)
    if (req.user.roles.includes('ADMIN')) {
      return next();
    }

    // Check if user has the required permission
    const hasPermission = req.user.permissions.includes(requiredPermission);
    
    if (!hasPermission) {
      return next(
        AppError.forbidden(
          `You do not have permission to ${action} ${resource}`,
          'PERMISSION_DENIED'
        )
      );
    }

    next();
  };
};

/**
 * Optional RBAC middleware - doesn't fail if no permission, just sets a flag
 * Useful for endpoints that return different data based on permissions
 */
const rbacOptional = (resource, action) => {
  return (req, res, next) => {
    const requiredPermission = `${resource}:${action}`;
    
    req.hasPermission = req.user?.permissions?.includes(requiredPermission) || false;
    
    next();
  };
};

module.exports = rbacMiddleware;
module.exports.rbacOptional = rbacOptional;
