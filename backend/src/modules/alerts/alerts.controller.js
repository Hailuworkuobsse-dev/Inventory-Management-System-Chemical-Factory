const alertsService = require('./alerts.service');
const { successResponse } = require('../../utils/responseHandler');

const alertsController = {
  async listAlerts(req, res, next) {
    try {
      const result = await alertsService.listAlerts(req.query);
      return successResponse(res, result, 'Alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAlert(req, res, next) {
    try {
      const alert = await alertsService.getAlert(req.params.id);
      return successResponse(res, alert, 'Alert details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateAlertStatus(req, res, next) {
    try {
      const { status } = req.body;
      const alert = await alertsService.updateAlertStatus(req.params.id, status, req.user.id);
      return successResponse(res, alert, 'Alert status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAlertConfigurations(req, res, next) {
    try {
      const configs = await alertsService.getConfigurations();
      return successResponse(res, configs, 'Alert configurations retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateAlertConfiguration(req, res, next) {
    try {
      const config = await alertsService.updateConfiguration(req.params.id, req.body);
      return successResponse(res, config, 'Alert configuration updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getExpiryAlerts(req, res, next) {
    try {
      const { days } = req.query;
      const alerts = await alertsService.getExpiryAlerts(parseInt(days) || 30);
      return successResponse(res, alerts, 'Expiry alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getStockOutAlerts(req, res, next) {
    try {
      const alerts = await alertsService.getStockOutAlerts();
      return successResponse(res, alerts, 'Stock-out alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = alertsController;