const salesService = require('./sales.service');
const { successResponse } = require('../../utils/responseHandler');

const salesController = {
  async listSalesOrders(req, res, next) {
    try {
      const result = await salesService.listSalesOrders(req.query);
      return successResponse(res, result, 'Sales orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSalesOrder(req, res, next) {
    try {
      const order = await salesService.getSalesOrder(req.params.id);
      return successResponse(res, order, 'Sales order details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createSalesOrder(req, res, next) {
    try {
      const order = await salesService.createSalesOrder(req.body, req.user.id);
      return successResponse(res, order, 'Sales order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateSalesOrderStatus(req, res, next) {
    try {
      const { status, trackingNumber } = req.body;
      const order = await salesService.updateSalesOrderStatus(
        req.params.id,
        status,
        trackingNumber,
        req.user.id
      );
      return successResponse(res, order, 'Sales order status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async createReturn(req, res, next) {
    try {
      const ret = await salesService.createReturn(req.params.id, req.body, req.user.id);
      return successResponse(res, ret, 'Return created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getReturn(req, res, next) {
    try {
      const ret = await salesService.getReturn(req.params.returnId);
      return successResponse(res, ret, 'Return details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateReturnDisposition(req, res, next) {
    try {
      const ret = await salesService.updateReturnDisposition(
        req.params.returnId,
        req.body.items,
        req.user.id
      );
      return successResponse(res, ret, 'Return disposition updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async listReturns(req, res, next) {
    try {
      const result = await salesService.listReturns(req.query);
      return successResponse(res, result, 'Returns retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = salesController;