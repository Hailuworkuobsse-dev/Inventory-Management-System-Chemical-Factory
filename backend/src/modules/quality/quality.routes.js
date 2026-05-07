const express = require('express');
const router = express.Router();
const qualityController = require('./quality.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Batch endpoints
router.get('/batches', rbacMiddleware('BATCH', 'READ'), qualityController.listBatches);
router.get('/batches/:id', rbacMiddleware('BATCH', 'READ'), qualityController.getBatch);

// Batch status changes
router.put('/batches/:id/quarantine', rbacMiddleware('BATCH', 'UPDATE'), qualityController.quarantineBatch);
router.put('/batches/:id/release', rbacMiddleware('BATCH', 'RELEASE_QUARANTINE'), qualityController.releaseBatch);
router.put('/batches/:id/recall', rbacMiddleware('BATCH', 'UPDATE'), qualityController.recallBatch);

// Lab tests
router.post('/batches/:id/lab-tests', rbacMiddleware('BATCH', 'UPDATE'), qualityController.addLabTest);

// EUDR documentation
router.get('/batches/:id/eudr-document', rbacMiddleware('BATCH', 'READ'), qualityController.getEudrDocument);
router.post('/batches/:id/eudr-document', rbacMiddleware('BATCH', 'CREATE'), qualityController.createEudrDocument);

module.exports = router;
