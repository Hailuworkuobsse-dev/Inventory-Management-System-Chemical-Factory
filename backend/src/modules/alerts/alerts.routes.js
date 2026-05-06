const express = require('express');
const router = express.Router();
const alertsController = require('./alerts.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Alert management routes
router.get('/', rbacMiddleware(['VIEW_ALERTS']), alertsController.listAlerts);
router.get('/:id', rbacMiddleware(['VIEW_ALERTS']), alertsController.getAlert);
router.put('/:id/status', rbacMiddleware(['MANAGE_ALERTS']), alertsController.updateAlertStatus);

// Alert configuration routes
router.get('/configurations', rbacMiddleware(['MANAGE_ALERTS']), alertsController.getAlertConfigurations);
router.put('/configurations/:id', rbacMiddleware(['ADMIN']), alertsController.updateAlertConfiguration);

// Specialized alert endpoints
router.get('/expiry', rbacMiddleware(['VIEW_ALERTS']), alertsController.getExpiryAlerts);
router.get('/stock-out', rbacMiddleware(['VIEW_ALERTS']), alertsController.getStockOutAlerts);

module.exports = router;