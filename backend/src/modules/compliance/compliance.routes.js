const express = require('express');
const router = express.Router();
const complianceController = require('./compliance.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Regulatory exports
router.post('/regulatory/export-eris', rbacMiddleware('COMPLIANCE', 'CREATE'), complianceController.exportEris);
router.post('/regulatory/export-tax', rbacMiddleware('COMPLIANCE', 'CREATE'), complianceController.exportTax);
router.post('/regulatory/export-audit', rbacMiddleware('COMPLIANCE', 'CREATE'), complianceController.exportAudit);
router.get('/regulatory/export-history', rbacMiddleware('COMPLIANCE', 'READ'), complianceController.getExportHistory);

// Audit logs
router.get('/audit-logs', rbacMiddleware('AUDIT_LOG', 'READ'), complianceController.listAuditLogs);
router.get('/audit-logs/:id', rbacMiddleware('AUDIT_LOG', 'READ'), complianceController.getAuditLog);

// Batch events (blockchain)
router.get('/batch-events', rbacMiddleware('BATCH_EVENT', 'READ'), complianceController.listBatchEvents);
router.get('/batch-events/:id', rbacMiddleware('BATCH_EVENT', 'READ'), complianceController.getBatchEvent);

module.exports = router;
