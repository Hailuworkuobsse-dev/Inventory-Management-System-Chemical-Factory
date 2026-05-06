const usersService = require('./users.service');
const { successResponse } = require('../../utils/responseHandler');

const usersController = {
  async listUsers(req, res, next) {
    try {
      const result = await usersService.listUsers(req.query);
      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const user = await usersService.getUser(req.params.id);
      return successResponse(res, user, 'User details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createUser(req, res, next) {
    try {
      const user = await usersService.createUser(req.body, req.user.id);
      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const user = await usersService.updateUser(req.params.id, req.body, req.user.id);
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      await usersService.deleteUser(req.params.id, req.user.id);
      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async assignRole(req, res, next) {
    try {
      const user = await usersService.assignRole(req.params.id, req.body.roleId, req.user.id);
      return successResponse(res, user, 'Role assigned successfully');
    } catch (error) {
      next(error);
    }
  },

  async removeRole(req, res, next) {
    try {
      const user = await usersService.removeRole(req.params.id, req.body.roleId, req.user.id);
      return successResponse(res, user, 'Role removed successfully');
    } catch (error) {
      next(error);
    }
  },

  async listRoles(req, res, next) {
    try {
      const roles = await usersService.listRoles();
      return successResponse(res, roles, 'Roles retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createRole(req, res, next) {
    try {
      const role = await usersService.createRole(req.body, req.user.id);
      return successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req, res, next) {
    try {
      const role = await usersService.updateRole(req.params.id, req.body, req.user.id);
      return successResponse(res, role, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPermissions(req, res, next) {
    try {
      const permissions = await usersService.getPermissions();
      return successResponse(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usersController;