const express = require('express');
const router = express.Router();
const procurementController = require('./procurement.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Supplier routes
router.get('/suppliers', rbacMiddleware(['VIEW_SUPPLIERS']), procurementController.listSuppliers);
router.get('/suppliers/:id', rbacMiddleware(['VIEW_SUPPLIERS']), procurementController.getSupplier);
router.post('/suppliers', rbacMiddleware(['MANAGE_SUPPLIERS']), procurementController.createSupplier);
router.put('/suppliers/:id', rbacMiddleware(['MANAGE_SUPPLIERS']), procurementController.updateSupplier);
router.get('/suppliers/:id/ratings', rbacMiddleware(['VIEW_SUPPLIERS']), procurementController.getSupplierRating);

// Purchase order routes
router.post('/purchase-orders', rbacMiddleware(['CREATE_PURCHASE_ORDER']), procurementController.createPurchaseOrder);
router.get('/purchase-orders', rbacMiddleware(['VIEW_PURCHASE_ORDERS']), procurementController.listPurchaseOrders);
router.get('/purchase-orders/:id', rbacMiddleware(['VIEW_PURCHASE_ORDERS']), procurementController.getPurchaseOrder);
router.put('/purchase-orders/:id', rbacMiddleware(['MANAGE_PURCHASE_ORDERS']), procurementController.updatePurchaseOrder);
router.post('/purchase-orders/:id/submit', rbacMiddleware(['APPROVE_PURCHASE_ORDER']), procurementController.submitPurchaseOrder);
router.post('/purchase-orders/:id/allocate-forex', rbacMiddleware(['MANAGE_FOREX']), procurementController.allocateForex);
router.get('/purchase-orders/prioritize', rbacMiddleware(['MANAGE_PURCHASE_ORDERS']), procurementController.prioritizePurchaseOrders);

// Forex routes
router.get('/forex-rates', rbacMiddleware(['VIEW_FOREX']), procurementController.listForexRates);
router.post('/forex-rates', rbacMiddleware(['MANAGE_FOREX']), procurementController.createForexRate);

module.exports = router;