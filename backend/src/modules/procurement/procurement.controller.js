const procurementService = require('./procurement.service');
const { successResponse } = require('../../utils/responseHandler');

const procurementController = {
  async listSuppliers(req, res, next) {
    try {
      const result = await procurementService.listSuppliers(req.query);
      return successResponse(res, result, 'Suppliers retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSupplier(req, res, next) {
    try {
      const supplier = await procurementService.getSupplier(req.params.id);
      return successResponse(res, supplier, 'Supplier details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createSupplier(req, res, next) {
    try {
      const supplier = await procurementService.createSupplier(req.body);
      return successResponse(res, supplier, 'Supplier created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateSupplier(req, res, next) {
    try {
      const supplier = await procurementService.updateSupplier(req.params.id, req.body);
      return successResponse(res, supplier, 'Supplier updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSupplierRating(req, res, next) {
    try {
      const rating = await procurementService.getSupplierRating(req.params.id, req.query.period);
      return successResponse(res, rating, 'Supplier rating retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createPurchaseOrder(req, res, next) {
    try {
      const po = await procurementService.createPurchaseOrder(req.body, req.user.id);
      return successResponse(res, po, 'Purchase order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async listPurchaseOrders(req, res, next) {
    try {
      const result = await procurementService.listPurchaseOrders(req.query);
      return successResponse(res, result, 'Purchase orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPurchaseOrder(req, res, next) {
    try {
      const po = await procurementService.getPurchaseOrder(req.params.id);
      return successResponse(res, po, 'Purchase order details retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updatePurchaseOrder(req, res, next) {
    try {
      const po = await procurementService.updatePurchaseOrder(req.params.id, req.body, req.user.id);
      return successResponse(res, po, 'Purchase order updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async submitPurchaseOrder(req, res, next) {
    try {
      const po = await procurementService.submitPurchaseOrder(req.params.id, req.user.id);
      return successResponse(res, po, 'Purchase order submitted successfully');
    } catch (error) {
      next(error);
    }
  },

  async allocateForex(req, res, next) {
    try {
      const allocation = await procurementService.allocateForex(req.params.id, req.body, req.user.id);
      return successResponse(res, allocation, 'Forex allocated successfully');
    } catch (error) {
      next(error);
    }
  },

  async prioritizePurchaseOrders(req, res, next) {
    try {
      const { budget, currency } = req.query;
      const prioritized = await procurementService.prioritizePurchaseOrders(
        parseFloat(budget),
        currency || 'USD'
      );
      return successResponse(res, prioritized, 'Prioritized purchase orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async listForexRates(req, res, next) {
    try {
      const rates = await procurementService.listForexRates(req.query.currency);
      return successResponse(res, rates, 'Forex rates retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createForexRate(req, res, next) {
    try {
      const rate = await procurementService.createForexRate(req.body, req.user.id);
      return successResponse(res, rate, 'Forex rate created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = procurementController;