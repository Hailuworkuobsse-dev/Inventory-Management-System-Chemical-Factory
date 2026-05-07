const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Stock visibility & query endpoints
router.get('/stock', rbacMiddleware('INVENTORY', 'READ'), inventoryController.listStock);
router.get('/stock/:stockId', rbacMiddleware('INVENTORY', 'READ'), inventoryController.getStock);

// Receipts endpoints
router.post('/receipts', rbacMiddleware('INVENTORY', 'CREATE'), inventoryController.createReceipt);
router.get('/receipts/:id', rbacMiddleware('INVENTORY', 'READ'), inventoryController.getReceipt);
router.put('/receipts/:id/accept', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.acceptReceipt);

// Stock movements
router.post('/stock/transfer', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.transferStock);
router.post('/stock/adjustment', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.adjustStock);
router.post('/stock/dispose', rbacMiddleware('INVENTORY', 'DELETE'), inventoryController.disposeStock);

// Picking & FEFO
router.post('/picking/reserve', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.reserveStock);
router.post('/picking/confirm', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.confirmPick);
router.post('/picking/pick-and-ship', rbacMiddleware('INVENTORY', 'UPDATE'), inventoryController.pickAndShip);

module.exports = router;
