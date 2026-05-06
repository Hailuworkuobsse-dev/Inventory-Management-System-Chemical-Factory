const inventoryService = require('./inventory.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

const inventoryController = {
  async listStock(req, res, next) {
    try {
      const result = await inventoryService.listStock(req.query);
      return successResponse(res, result, 'Stock list retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getStock(req, res, next) {
    try {
      const stock = await inventoryService.getStock(req.params.stockId);
      return successResponse(res, stock, 'Stock details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createReceipt(req, res, next) {
    try {
      const receipt = await inventoryService.createReceipt(req.body);
      return successResponse(res, receipt, 'Receipt created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async acceptReceipt(req, res, next) {
    try {
      const receipt = await inventoryService.acceptReceipt(
        req.params.id,
        req.body
      );
      return successResponse(res, receipt, 'Receipt accepted successfully');
    } catch (error) {
      next(error);
    }
  },

  async transferStock(req, res, next) {
    try {
      const result = await inventoryService.transferStock(req.body);
      return successResponse(res, result, 'Stock transferred successfully');
    } catch (error) {
      next(error);
    }
  },

  async adjustStock(req, res, next) {
    try {
      const result = await inventoryService.adjustStock(req.body);
      return successResponse(res, result, 'Stock adjusted successfully');
    } catch (error) {
      next(error);
    }
  },

  async disposeStock(req, res, next) {
    try {
      const result = await inventoryService.disposeStock(req.body);
      return successResponse(res, result, 'Stock disposed successfully');
    } catch (error) {
      next(error);
    }
  },

  async reserveStock(req, res, next) {
    try {
      const result = await inventoryService.reserveStock(req.body);
      return successResponse(res, result, 'Stock reserved successfully');
    } catch (error) {
      next(error);
    }
  },

  async confirmPick(req, res, next) {
    try {
      const result = await inventoryService.confirmPick(req.body);
      return successResponse(res, result, 'Pick confirmed successfully');
    } catch (error) {
      next(error);
    }
  },

  async listReceipts(req, res, next) {
    try {
      const result = await inventoryService.listReceipts(req.query);
      return successResponse(res, result, 'Receipts list retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getReceipt(req, res, next) {
    try {
      const receipt = await inventoryService.getReceipt(req.params.id);
      return successResponse(res, receipt, 'Receipt details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inventoryController;
