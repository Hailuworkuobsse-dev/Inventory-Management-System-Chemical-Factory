const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');
const notificationService = require('../../services/notification.service');

/**
 * IoT Service
 * Handles sensor data ingestion, environmental monitoring, and excursion alerts (FR-012, FR-016)
 */
class IoTService {
  /**
   * Process sensor reading from MQTT or direct API call
   * @param {Object} readingData - Sensor reading data
   * @returns {Promise<Object>} - Created IoT reading with any triggered alerts
   */
  async processSensorReading(readingData) {
    const { sensorId, sensorType, value, unit, timestamp, quality } = readingData;

    // Find or create sensor
    let sensor = await prisma.iotSensor.findUnique({
      where: { sensorId },
    });

    if (!sensor) {
      // Auto-register unknown sensors (could be restricted in production)
      sensor = await prisma.iotSensor.create({
        data: {
          sensorId,
          name: `Sensor ${sensorId}`,
          type: sensorType.toUpperCase(),
          status: 'ACTIVE',
        },
      });
    }

    // Create reading
    const reading = await prisma.iotReading.create({
      data: {
        sensorId: sensor.id,
        zoneId: sensor.zoneId,
        readingType: sensorType.toUpperCase(),
        value,
        unit: unit || 'CELSIUS',
        timestamp: timestamp || new Date(),
      },
    });

    // Check for threshold violations
    const alert = await this.checkThresholds(sensor, value);

    return {
      reading,
      alert,
    };
  }

  /**
   * Ingest sensor reading via API
   * @param {Object} readingData - Reading data
   * @returns {Promise<Object>} - Created reading
   */
  async ingestReading(readingData) {
    const { sensorId, zoneId, readingType, value, timestamp } = readingData;

    // Find sensor
    const sensor = await prisma.iotSensor.findFirst({
      where: { 
        OR: [
          { sensorId },
          { id: zoneId }
        ]
      },
    });

    if (!sensor) {
      throw AppError.notFound('Sensor not found');
    }

    // Create reading
    const reading = await prisma.iotReading.create({
      data: {
        sensorId: sensor.id,
        zoneId: sensor.zoneId,
        readingType: readingType.toUpperCase(),
        value,
        unit: this.getDefaultUnit(readingType),
        timestamp: timestamp || new Date(),
      },
      include: {
        sensor: true,
        zone: true,
      },
    });

    // Check thresholds
    await this.checkThresholds(sensor, value, reading.id);

    return reading;
  }

  /**
   * Get IoT readings with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} - Array of readings
   */
  async getReadings(filters) {
    const { sensorId, zoneId, from, to, lastN } = filters;

    const where = {};

    if (sensorId) {
      where.sensor = { sensorId };
    }

    if (zoneId) {
      where.zoneId = zoneId;
    }

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const options = {
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        sensor: {
          select: {
            sensorId: true,
            name: true,
            type: true,
          },
        },
        zone: {
          select: {
            name: true,
            zoneType: true,
          },
        },
      },
    };

    if (lastN) {
      options.take = parseInt(lastN);
    } else {
      options.take = 100;
    }

    const readings = await prisma.iotReading.findMany(options);
    return readings.reverse(); // Return in chronological order
  }

  /**
   * Get IoT alerts with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} - Array of alerts
   */
  async getAlerts(filters) {
    const { acknowledged, type, from, to } = filters;

    const where = {};

    if (acknowledged !== undefined) {
      where.acknowledged = acknowledged;
    }

    if (type) {
      where.alertType = type;
    }

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    return await prisma.iotAlert.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        sensor: {
          select: {
            sensorId: true,
            name: true,
          },
        },
        zone: {
          select: {
            name: true,
            zoneType: true,
          },
        },
        acknowledgedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Acknowledge an IoT alert
   * @param {number} alertId - Alert ID
   * @param {number} userId - User ID acknowledging the alert
   * @returns {Promise<Object>} - Updated alert
   */
  async acknowledgeAlert(alertId, userId) {
    const alert = await prisma.iotAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedByUserId: userId,
      },
      include: {
        sensor: true,
        zone: true,
        acknowledgedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return alert;
  }

  /**
   * Check sensor reading against thresholds
   * @param {Object} sensor - Sensor object
   * @param {number} value - Reading value
   * @param {number} [readingId] - Associated reading ID
   * @returns {Promise<Object|null>} - Created alert if threshold violated
   */
  async checkThresholds(sensor, value, readingId = null) {
    // Get thresholds for this zone/product
    const thresholds = await prisma.alertThreshold.findMany({
      where: {
        OR: [
          { productId: null }, // Global thresholds
          { 
            product: {
              storageRequirements: {
                contains: sensor.type
              }
            }
          },
        ],
      },
    });

    let violatedThreshold = null;

    for (const threshold of thresholds) {
      if (threshold.alertType === 'TEMPERATURE_MAX' && value > (threshold.value || 25)) {
        violatedThreshold = { ...threshold, thresholdType: 'MAX' };
        break;
      }
      if (threshold.alertType === 'TEMPERATURE_MIN' && value < (threshold.value || 2)) {
        violatedThreshold = { ...threshold, thresholdType: 'MIN' };
        break;
      }
      if (threshold.alertType === 'HUMIDITY_MAX' && value > (threshold.value || 60)) {
        violatedThreshold = { ...threshold, thresholdType: 'MAX' };
        break;
      }
      if (threshold.alertType === 'HUMIDITY_MIN' && value < (threshold.value || 30)) {
        violatedThreshold = { ...threshold, thresholdType: 'MIN' };
        break;
      }
    }

    if (violatedThreshold) {
      // Create alert
      const alert = await prisma.iotAlert.create({
        data: {
          sensorId: sensor.id,
          zoneId: sensor.zoneId,
          readingId,
          alertType: violatedThreshold.alertType,
          thresholdValue: violatedThreshold.value,
          actualValue: value,
          thresholdType: violatedThreshold.thresholdType,
          message: `${sensor.type} ${violatedThreshold.thresholdType === 'MAX' ? 'exceeds' : 'below'} threshold (${value} vs ${violatedThreshold.value})`,
          severity: 'HIGH',
          acknowledged: false,
        },
        include: {
          sensor: true,
          zone: true,
        },
      });

      // Send notification
      await notificationService.notifyTemperatureExcursion({
        zoneName: alert.zone.name,
        value,
        thresholdType: violatedThreshold.thresholdType,
        thresholdValue: violatedThreshold.value,
      });

      return alert;
    }

    return null;
  }

  /**
   * Get default unit for reading type
   * @param {string} readingType - Reading type
   * @returns {string} - Default unit
   */
  getDefaultUnit(readingType) {
    const units = {
      TEMPERATURE: 'CELSIUS',
      HUMIDITY: 'PERCENT',
      PRESSURE: 'PASCAL',
      CO2: 'PPM',
    };
    return units[readingType] || 'UNKNOWN';
  }
}

module.exports = new IoTService();
