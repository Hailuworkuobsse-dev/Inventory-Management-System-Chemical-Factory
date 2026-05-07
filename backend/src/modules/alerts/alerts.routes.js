const express = require('express');
const router = express.Router();
const alertsController = require('./alerts.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Alerts endpoints
router.get('/alerts', rbacMiddleware('ALERT', 'READ'), alertsController.listAlerts);
router.put('/alerts/:id/acknowledge', rbacMiddleware('ALERT', 'UPDATE'), alertsController.acknowledgeAlert);

// Alert thresholds
router.get('/alert-thresholds', rbacMiddleware('ALERT', 'READ'), alertsController.listAlertThresholds);
router.post('/alert-thresholds', rbacMiddleware('ALERT', 'CREATE'), alertsController.createAlertThreshold);
router.put('/alert-thresholds/:id', rbacMiddleware('ALERT', 'UPDATE'), alertsController.updateAlertThreshold);
router.delete('/alert-thresholds/:id', rbacMiddleware('ALERT', 'DELETE'), alertsController.deleteAlertThreshold);

module.exports = router;
