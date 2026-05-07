const Joi = require('joi');

const recordSensorReadingSchema = Joi.object({
  sensorId: Joi.string().required(),
  warehouseId: Joi.string().uuid().required(),
  zoneId: Joi.string().uuid().optional(),
  temperature: Joi.number().optional(),
  humidity: Joi.number().min(0).max(100).optional(),
  co2Level: Joi.number().optional(),
  timestamp: Joi.date().iso().default(() => new Date())
});

const updateThresholdSchema = Joi.object({
  metricType: Joi.string().valid('TEMPERATURE', 'HUMIDITY', 'CO2').required(),
  min: Joi.number().optional(),
  max: Joi.number().optional()
});

const getSensorDataSchema = Joi.object({
  sensorId: Joi.string().optional(),
  warehouseId: Joi.string().uuid().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  metrics: Joi.array().items(Joi.string().valid('temperature', 'humidity', 'co2Level')).default(['temperature', 'humidity'])
});

module.exports = {
  recordSensorReadingSchema,
  updateThresholdSchema,
  getSensorDataSchema
};
