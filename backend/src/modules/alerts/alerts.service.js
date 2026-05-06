const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');

const alertsService = {
  async listAlerts(query) {
    const { status, type, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take,
        include: {
          product: true,
          batch: true,
          warehouse: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.alert.count({ where })
    ]);

    return {
      items: alerts,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  },

  async getAlert(id) {
    const alert = await prisma.alert.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true,
        batch: true,
        warehouse: true,
        createdBy: true,
        updatedBy: true
      }
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'NOT_FOUND');
    }

    return alert;
  },

  async updateAlertStatus(id, status, userId) {
    const alert = await prisma.alert.update({
      where: { id: parseInt(id) },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
        resolvedById: status === 'RESOLVED' ? userId : null
      },
      include: {
        product: true,
        batch: true
      }
    });

    return alert;
  },

  async getConfigurations() {
    const configs = await prisma.alertConfiguration.findMany({
      include: {
        createdBy: true,
        updatedBy: true
      }
    });
    return configs;
  },

  async updateConfiguration(id, data) {
    const config = await prisma.alertConfiguration.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    return config;
  },

  async getExpiryAlerts(days) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const batches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: expiryDate
        },
        status: 'RELEASED'
      },
      include: {
        product: true,
        stocks: {
          where: { quantity: { gt: 0 } },
          include: { warehouse: true }
        }
      }
    });

    const alerts = batches.map(batch => ({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productId: batch.productId,
      productName: batch.product.name,
      expiryDate: batch.expiryDate,
      daysUntilExpiry: Math.ceil((batch.expiryDate - new Date()) / (1000 * 60 * 60 * 24)),
      totalQuantity: batch.stocks.reduce((sum, s) => sum + s.quantity, 0),
      locations: batch.stocks.map(s => ({
        warehouseId: s.warehouseId,
        warehouseName: s.warehouse.name,
        quantity: s.quantity
      }))
    }));

    return alerts;
  },

  async getStockOutAlerts() {
    const products = await prisma.product.findMany({
      include: {
        stocks: {
          where: { quantity: { gt: 0 } }
        }
      }
    });

    const alerts = [];
    for (const product of products) {
      const totalStock = product.stocks.reduce((sum, s) => sum + s.quantity, 0);
      if (totalStock <= product.safetyStock || 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: totalStock,
          safetyStock: product.safetyStock,
          isEssential: product.isEssentialMedicine,
          severity: totalStock === 0 ? 'CRITICAL' : 'WARNING'
        });
      }
    }

    return alerts.sort((a, b) => {
      if (a.severity === 'CRITICAL') return -1;
      if (b.severity === 'CRITICAL') return 1;
      return b.currentStock - a.currentStock;
    });
  }
};

module.exports = alertsService;