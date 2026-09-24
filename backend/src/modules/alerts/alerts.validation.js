const Joi = require('joi');

const alertsValidation = {
  updateAlertStatus: Joi.object({
    status: Joi.string().valid('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED').required()
  }),

  updateConfiguration: Joi.object({
    alertType: Joi.string().required(),
    threshold: Joi.number().optional(),
    enabled: Joi.boolean().optional(),
    notificationChannels: Joi.array().items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'DASHBOARD')).optional()
  })
};

module.exports = alertsValidation;