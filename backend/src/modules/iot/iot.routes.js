const express = require('express');
const router = express.Router();
const iotController = require('./iot.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const rbacMiddleware = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authMiddleware);

// IoT sensor readings
router.post('/readings', rbacMiddleware('IOT', 'CREATE'), iotController.ingestReading);
router.get('/readings', rbacMiddleware('IOT', 'READ'), iotController.getReadings);

// IoT alerts
router.get('/alerts', rbacMiddleware('IOT', 'READ'), iotController.getAlerts);
router.put('/alerts/:id/acknowledge', rbacMiddleware('IOT', 'UPDATE'), iotController.acknowledgeAlert);

module.exports = router;
