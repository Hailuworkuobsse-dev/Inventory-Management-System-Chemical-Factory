const express = require('express');
const router = express.Router();
const productionController = require('./production.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// BOM endpoints
router.post('/boms', rbacMiddleware('BOM', 'CREATE'), productionController.createBom);
router.get('/boms', rbacMiddleware('BOM', 'READ'), productionController.listBoms);
router.put('/boms/:id', rbacMiddleware('BOM', 'UPDATE'), productionController.updateBom);

// Work Orders endpoints
router.post('/work-orders', rbacMiddleware('WORK_ORDER', 'CREATE'), productionController.createWorkOrder);
router.get('/work-orders', rbacMiddleware('WORK_ORDER', 'READ'), productionController.listWorkOrders);
router.put('/work-orders/:id/materials', rbacMiddleware('WORK_ORDER', 'UPDATE'), productionController.recordMaterials);
router.put('/work-orders/:id/complete', rbacMiddleware('WORK_ORDER', 'UPDATE'), productionController.completeWorkOrder);
router.get('/work-orders/:id/yield', rbacMiddleware('WORK_ORDER', 'READ'), productionController.getYieldAnalysis);

module.exports = router;
