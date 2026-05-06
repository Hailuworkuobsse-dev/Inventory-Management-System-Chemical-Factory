const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// All routes require authentication
router.use(authMiddleware);

// Stock endpoints
router.get('/stock', rbacMiddleware('INVENTORY', 'READ'), inventoryController.listStock);
router.get('/stock/:stockId', rbacMiddleware('INVENTORY', 'READ'), inventoryController.getStock);
router.post('/stock/transfer', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.transferStock);
router.post('/stock/adjustment', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.adjustStock);
router.post('/stock/dispose', rbacMiddleware('INVENTORY', 'DELETE'), inventoryController.disposeStock);

// Picking endpoints
router.post('/picking/reserve', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.reserveStock);
router.post('/picking/confirm', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.confirmPick);

// Receipts endpoints
router.get('/receipts', rbacMiddleware('INVENTORY', 'READ'), inventoryController.listReceipts);
router.get('/receipts/:id', rbacMiddleware('INVENTORY', 'READ'), inventoryController.getReceipt);
router.post('/receipts', rbacMiddleware('INVENTORY', 'CREATE'), inventoryController.createReceipt);
router.put('/receipts/:id/accept', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.acceptReceipt);

module.exports = router;
