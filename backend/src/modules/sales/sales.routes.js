const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Sales order routes
router.post('/', rbacMiddleware(['CREATE_SALES_ORDER']), salesController.createSalesOrder);
router.get('/', rbacMiddleware(['VIEW_SALES_ORDERS']), salesController.listSalesOrders);
router.get('/:id', rbacMiddleware(['VIEW_SALES_ORDERS']), salesController.getSalesOrder);
router.put('/:id/status', rbacMiddleware(['MANAGE_SALES_ORDERS']), salesController.updateSalesOrderStatus);

// Return routes
router.post('/:id/returns', rbacMiddleware(['CREATE_RETURN']), salesController.createReturn);
router.get('/returns/:returnId', rbacMiddleware(['VIEW_RETURNS']), salesController.getReturn);
router.put('/returns/:returnId/disposition', rbacMiddleware(['MANAGE_RETURNS']), salesController.updateReturnDisposition);
router.get('/returns', rbacMiddleware(['VIEW_RETURNS']), salesController.listReturns);

module.exports = router;