const express = require('express');
const router = express.Router();
const reportingController = require('./reporting.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Analytics reports
router.get('/reports/abc-analysis', rbacMiddleware('REPORT', 'READ'), reportingController.getAbcAnalysis);
router.get('/reports/inventory-turnover', rbacMiddleware('REPORT', 'READ'), reportingController.getInventoryTurnover);
router.get('/reports/slow-movers', rbacMiddleware('REPORT', 'READ'), reportingController.getSlowMovers);
router.get('/reports/stock-valuation', rbacMiddleware('REPORT', 'READ'), reportingController.getStockValuation);
router.get('/reports/expiry-nearing', rbacMiddleware('REPORT', 'READ'), reportingController.getExpiryNearing);
router.get('/reports/stock-out-risk', rbacMiddleware('REPORT', 'READ'), reportingController.getStockOutRisk);
router.get('/reports/shrinkage', rbacMiddleware('REPORT', 'READ'), reportingController.getShrinkageReport);
router.get('/reports/demand-forecast', rbacMiddleware('REPORT', 'READ'), reportingController.getDemandForecast);

// Dashboards
router.get('/dashboards/executive', rbacMiddleware('DASHBOARD', 'READ'), reportingController.getExecutiveDashboard);

module.exports = router;
