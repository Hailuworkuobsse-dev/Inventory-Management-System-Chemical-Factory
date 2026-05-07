const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Users endpoints
router.get('/users', rbacMiddleware('USER', 'READ'), usersController.listUsers);
router.post('/users', rbacMiddleware('USER', 'CREATE'), usersController.createUser);
router.put('/users/:id', rbacMiddleware('USER', 'UPDATE'), usersController.updateUser);
router.get('/users/:id/audit-log', rbacMiddleware('AUDIT_LOG', 'READ'), usersController.getUserAuditLog);
router.put('/users/:id/warehouse-scope', rbacMiddleware('USER', 'UPDATE'), usersController.updateWarehouseScope);

// Roles endpoints
router.get('/roles', rbacMiddleware('ROLE', 'READ'), usersController.listRoles);
router.post('/roles', rbacMiddleware('ROLE', 'CREATE'), usersController.createRole);

// Permissions endpoints
router.get('/permissions', rbacMiddleware('PERMISSION', 'READ'), usersController.listPermissions);

module.exports = router;
