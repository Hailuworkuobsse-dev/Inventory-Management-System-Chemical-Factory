const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Sales Orders endpoints
router.post('/sales-orders', rbacMiddleware('SALES_ORDER', 'CREATE'), salesController.createSalesOrder);
router.get('/sales-orders', rbacMiddleware('SALES_ORDER', 'READ'), salesController.listSalesOrders);
router.get('/sales-orders/:id', rbacMiddleware('SALES_ORDER', 'READ'), salesController.getSalesOrder);
router.put('/sales-orders/:id/status', rbacMiddleware('SALES_ORDER', 'UPDATE'), salesController.updateOrderStatus);

// Returns endpoints
router.post('/sales-orders/:id/returns', rbacMiddleware('SALES_ORDER', 'UPDATE'), salesController.createReturn);
router.get('/returns/:id', rbacMiddleware('SALES_ORDER', 'READ'), salesController.getReturn);
router.post('/returns/:id/disposition', rbacMiddleware('SALES_ORDER', 'UPDATE'), salesController.setDisposition);

// Customer portal (limited access)
router.get('/customer-portal/stock', salesController.getCustomerStock);

module.exports = router;
