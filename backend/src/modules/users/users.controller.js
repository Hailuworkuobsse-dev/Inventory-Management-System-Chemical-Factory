const usersService = require('./users.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const userSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.employeeId) {
    errors.push({ message: 'employeeId is required', path: ['employeeId'] });
  } else {
    value.employeeId = data.employeeId;
  }

  if (!data.fullName) {
    errors.push({ message: 'fullName is required', path: ['fullName'] });
  } else {
    value.fullName = data.fullName;
  }

  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push({ message: 'Valid email is required', path: ['email'] });
  } else {
    value.email = data.email.toLowerCase();
  }

  if (data.password) {
    if (data.password.length < 6) {
      errors.push({ message: 'Password must be at least 6 characters', path: ['password'] });
    } else {
      value.password = data.password;
    }
  }

  value.isActive = data.isActive !== undefined ? data.isActive : true;

  if (data.roles && Array.isArray(data.roles)) {
    value.roles = data.roles.map(r => parseInt(r));
  }

  if (data.warehouseIds && Array.isArray(data.warehouseIds)) {
    value.warehouseIds = data.warehouseIds.map(id => parseInt(id));
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const roleSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.name) {
    errors.push({ message: 'name is required', path: ['name'] });
  } else {
    value.name = data.name.toUpperCase();
  }

  value.description = data.description || null;

  if (data.permissions && Array.isArray(data.permissions)) {
    value.permissions = data.permissions.map(p => parseInt(p));
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const warehouseScopeSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.warehouseIds || !Array.isArray(data.warehouseIds)) {
    errors.push({ message: 'warehouseIds array is required', path: ['warehouseIds'] });
  } else {
    value.warehouseIds = data.warehouseIds.map(id => parseInt(id));
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * Users Controller
 * Handles user CRUD, role/permission management, and audit logs
 */
class UsersController {
  /**
   * GET /api/v1/users
   * List users
   */
  async listUsers(req, res, next) {
    try {
      const { role, active, search, page = 1, limit = 50 } = req.query;
      
      const filters = {
        role,
        active: active !== undefined ? active === 'true' : undefined,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await usersService.listUsers(filters);

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users
   * Create a user
   */
  async createUser(req, res, next) {
    try {
      const validated = await userSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const user = await usersService.createUser(validated.value, req.user.id);

      // Exclude password from response
      delete user.passwordHash;

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user details / roles
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 'INVALID_ID', 400);
      }

      const validated = await userSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const user = await usersService.updateUser(userId, validated.value, req.user.id);

      // Exclude password from response
      delete user.passwordHash;

      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id/audit-log
   * Get a user's activity history
   */
  async getUserAuditLog(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 'INVALID_ID', 400);
      }

      const { page = 1, limit = 50 } = req.query;

      const result = await usersService.getUserAuditLog(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return successResponse(res, result, 'Audit log retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id/warehouse-scope
   * Assign warehouse restrictions
   */
  async updateWarehouseScope(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 'INVALID_ID', 400);
      }

      const validated = await warehouseScopeSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const user = await usersService.updateWarehouseScope(userId, validated.value.warehouseIds, req.user.id);

      return successResponse(res, user, 'Warehouse scope updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/roles
   * List roles
   */
  async listRoles(req, res, next) {
    try {
      const roles = await usersService.listRoles();

      return successResponse(res, roles, 'Roles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/roles
   * Create a role
   */
  async createRole(req, res, next) {
    try {
      const validated = await roleSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const role = await usersService.createRole(validated.value, req.user.id);

      return successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/permissions
   * List all permissions
   */
  async listPermissions(req, res, next) {
    try {
      const permissions = await usersService.listPermissions();

      return successResponse(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
module.exports.userSchema = userSchema;
module.exports.roleSchema = roleSchema;
module.exports.warehouseScopeSchema = warehouseScopeSchema;
