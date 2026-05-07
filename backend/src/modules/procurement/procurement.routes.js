const express = require('express');
const router = express.Router();
const procurementController = require('./procurement.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Suppliers endpoints
router.get('/suppliers', rbacMiddleware('SUPPLIER', 'READ'), procurementController.listSuppliers);
router.post('/suppliers', rbacMiddleware('SUPPLIER', 'CREATE'), procurementController.createSupplier);
router.put('/suppliers/:id', rbacMiddleware('SUPPLIER', 'UPDATE'), procurementController.updateSupplier);
router.get('/suppliers/:id/ratings', rbacMiddleware('SUPPLIER', 'READ'), procurementController.getSupplierRatings);
router.post('/suppliers/:id/ratings', rbacMiddleware('SUPPLIER', 'UPDATE'), procurementController.createSupplierRating);

// Purchase Orders endpoints
router.post('/purchase-orders', rbacMiddleware('PURCHASE_ORDER', 'CREATE'), procurementController.createPurchaseOrder);
router.get('/purchase-orders', rbacMiddleware('PURCHASE_ORDER', 'READ'), procurementController.listPurchaseOrders);
router.get('/purchase-orders/:id', rbacMiddleware('PURCHASE_ORDER', 'READ'), procurementController.getPurchaseOrder);
router.put('/purchase-orders/:id', rbacMiddleware('PURCHASE_ORDER', 'UPDATE'), procurementController.updatePurchaseOrder);
router.post('/purchase-orders/:id/submit', rbacMiddleware('PURCHASE_ORDER', 'UPDATE'), procurementController.submitPurchaseOrder);
router.post('/purchase-orders/:id/allocate-forex', rbacMiddleware('PURCHASE_ORDER', 'UPDATE'), procurementController.allocateForex);
router.get('/purchase-orders/prioritize', rbacMiddleware('PURCHASE_ORDER', 'READ'), procurementController.prioritizePurchaseOrders);

// Forex rates
router.get('/forex-rates', rbacMiddleware('FOREX', 'READ'), procurementController.listForexRates);
router.post('/forex-rates', rbacMiddleware('FOREX', 'CREATE'), procurementController.createForexRate);

module.exports = router;
