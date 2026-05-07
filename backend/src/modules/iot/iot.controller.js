const iotService = require('./iot.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

// Validation schemas
const iotReadingSchema = async (data) => {
  const errors = [];
  const value = {};

  if (!data.sensorId) {
    errors.push({ message: 'sensorId is required', path: ['sensorId'] });
  } else {
    value.sensorId = data.sensorId;
  }

  if (!data.zoneId) {
    errors.push({ message: 'zoneId is required', path: ['zoneId'] });
  } else {
    value.zoneId = parseInt(data.zoneId);
  }

  if (!data.readingType) {
    errors.push({ message: 'readingType is required', path: ['readingType'] });
  } else {
    value.readingType = data.readingType.toUpperCase(); // TEMPERATURE, HUMIDITY
  }

  if (data.value === undefined || data.value === null) {
    errors.push({ message: 'value is required', path: ['value'] });
  } else {
    value.value = parseFloat(data.value);
  }

  if (data.timestamp) {
    const date = new Date(data.timestamp);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'timestamp must be a valid date', path: ['timestamp'] });
    } else {
      value.timestamp = date;
    }
  } else {
    value.timestamp = new Date();
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const iotReadingsQuerySchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.sensorId) {
    value.sensorId = query.sensorId;
  }

  if (query.zoneId) {
    const zoneId = parseInt(query.zoneId);
    if (isNaN(zoneId)) {
      errors.push({ message: 'zoneId must be a number', path: ['zoneId'] });
    } else {
      value.zoneId = zoneId;
    }
  }

  if (query.from) {
    const date = new Date(query.from);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'from must be a valid date', path: ['from'] });
    } else {
      value.from = date;
    }
  }

  if (query.to) {
    const date = new Date(query.to);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'to must be a valid date', path: ['to'] });
    } else {
      value.to = date;
    }
  }

  if (query.lastN) {
    const lastN = parseInt(query.lastN);
    if (isNaN(lastN) || lastN <= 0) {
      errors.push({ message: 'lastN must be a positive number', path: ['lastN'] });
    } else {
      value.lastN = lastN;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

const alertsQuerySchema = async (query) => {
  const errors = [];
  const value = {};

  if (query.acknowledged !== undefined) {
    value.acknowledged = query.acknowledged === 'true';
  }

  if (query.type) {
    value.type = query.type.toUpperCase();
  }

  if (query.from) {
    const date = new Date(query.from);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'from must be a valid date', path: ['from'] });
    } else {
      value.from = date;
    }
  }

  if (query.to) {
    const date = new Date(query.to);
    if (isNaN(date.getTime())) {
      errors.push({ message: 'to must be a valid date', path: ['to'] });
    } else {
      value.to = date;
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value,
  };
};

/**
 * IoT Controller
 * Handles sensor readings ingestion, environmental monitoring, and excursion alerts
 */
class IoTController {
  /**
   * POST /api/v1/iot/readings
   * Ingest sensor reading (system)
   */
  async ingestReading(req, res, next) {
    try {
      const validated = await iotReadingSchema(req.body);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const reading = await iotService.ingestReading(validated.value);

      return successResponse(res, reading, 'Sensor reading ingested successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/iot/readings
   * Query temperature/humidity logs
   */
  async getReadings(req, res, next) {
    try {
      const validated = await iotReadingsQuerySchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const readings = await iotService.getReadings(validated.value);

      return successResponse(res, readings, 'IoT readings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/iot/alerts
   * List temperature excursion alerts
   */
  async getAlerts(req, res, next) {
    try {
      const validated = await alertsQuerySchema(req.query);
      
      if (validated.error) {
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, validated.error.details);
      }

      const alerts = await iotService.getAlerts(validated.value);

      return successResponse(res, alerts, 'IoT alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/iot/alerts/:id/acknowledge
   * Acknowledge an alert
   */
  async acknowledgeAlert(req, res, next) {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return errorResponse(res, 'Invalid alert ID', 'INVALID_ID', 400);
      }

      const alert = await iotService.acknowledgeAlert(alertId, req.user.id);

      return successResponse(res, alert, 'Alert acknowledged successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IoTController();
module.exports.iotReadingSchema = iotReadingSchema;
module.exports.iotReadingsQuerySchema = iotReadingsQuerySchema;
module.exports.alertsQuerySchema = alertsQuerySchema;
