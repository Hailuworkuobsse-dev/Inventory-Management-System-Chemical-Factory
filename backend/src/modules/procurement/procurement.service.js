const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');

const procurementService = {
  async listSuppliers(query) {
    const { isActive, search, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take,
        include: {
          ratings: true,
          certificates: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where })
    ]);

    return {
      items: suppliers,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  },

  async getSupplier(id) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        ratings: true,
        certificates: true,
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'NOT_FOUND');
    }

    return supplier;
  },

  async createSupplier(data) {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        country: data.country,
        isActive: data.isActive ?? true,
        isCertified: data.isCertified ?? false,
        certificateExpiryDate: data.certificateExpiryDate ? new Date(data.certificateExpiryDate) : null
      }
    });
    return supplier;
  },

  async updateSupplier(id, data) {
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        certificateExpiryDate: data.certificateExpiryDate ? new Date(data.certificateExpiryDate) : undefined
      }
    });
    return supplier;
  },

  async getSupplierRating(id, period) {
    const where = { supplierId: parseInt(id) };
    if (period) {
      const [start, end] = period.split('_');
      if (start && end) {
        where.periodStart = new Date(start);
        where.periodEnd = new Date(end);
      }
    }

    const ratings = await prisma.supplierRating.findMany({
      where,
      orderBy: { periodEnd: 'desc' }
    });

    return ratings.length > 0 ? ratings[0] : null;
  },

  async createPurchaseOrder(data, userId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'NOT_FOUND');
    }

    if (!supplier.isActive) {
      throw new AppError('Cannot create PO for inactive supplier', 400, 'VALIDATION_ERROR');
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        currency: data.currency || 'USD',
        lcId: data.lcId,
        status: 'DRAFT',
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            currency: data.currency || 'USD'
          }))
        },
        createdBy: userId
      },
      include: {
        items: { include: { product: true } },
        supplier: true
      }
    });

    return po;
  },

  async listPurchaseOrders(query) {
    const { status, supplierId, dateFrom, dateTo, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = parseInt(supplierId);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: true } },
          supplier: true,
          forexAllocations: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return {
      items: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  },

  async getPurchaseOrder(id) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true } },
        supplier: true,
        forexAllocations: true,
        receipts: true
      }
    });

    if (!po) {
      throw new AppError('Purchase order not found', 404, 'NOT_FOUND');
    }

    return po;
  },

  async updatePurchaseOrder(id, data, userId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!po) {
      throw new AppError('Purchase order not found', 404, 'NOT_FOUND');
    }

    if (po.status !== 'DRAFT') {
      throw new AppError('Can only update DRAFT purchase orders', 400, 'VALIDATION_ERROR');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined
      },
      include: {
        items: { include: { product: true } },
        supplier: true
      }
    });

    return updated;
  },

  async submitPurchaseOrder(id, userId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!po) {
      throw new AppError('Purchase order not found', 404, 'NOT_FOUND');
    }

    if (po.status !== 'DRAFT') {
      throw new AppError('Only DRAFT purchase orders can be submitted', 400, 'VALIDATION_ERROR');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
      include: {
        items: { include: { product: true } },
        supplier: true
      }
    });

    return updated;
  },

  async allocateForex(id, data, userId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!po) {
      throw new AppError('Purchase order not found', 404, 'NOT_FOUND');
    }

    const allocation = await prisma.forexAllocation.create({
      data: {
        purchaseOrderId: parseInt(id),
        allocatedAmount: data.allocatedAmount,
        rate: data.rate,
        allocatedBy: userId
      },
      include: {
        purchaseOrder: true
      }
    });

    return allocation;
  },

  async prioritizePurchaseOrders(budget, currency) {
    const draftOrders = await prisma.purchaseOrder.findMany({
      where: { status: 'DRAFT', currency },
      include: {
        items: { include: { product: true } },
        supplier: true
      }
    });

    const prioritized = draftOrders.map(po => {
      const totalValue = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // Calculate priority based on stock-out risk
      let priorityScore = 0;
      po.items.forEach(item => {
        if (item.product.safetyStock) {
          priorityScore += item.product.safetyStock;
        }
      });

      return {
        purchaseOrderId: po.id,
        supplierName: po.supplier.name,
        totalValue,
        currency,
        priorityScore,
        itemCount: po.items.length,
        expectedDate: po.expectedDate
      };
    });

    // Sort by priority score (higher is more urgent)
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    // Select orders that fit within budget
    let remainingBudget = budget;
    const selected = [];
    for (const order of prioritized) {
      if (order.totalValue <= remainingBudget) {
        selected.push({ ...order, selected: true });
        remainingBudget -= order.totalValue;
      } else {
        selected.push({ ...order, selected: false, reason: 'Insufficient budget' });
      }
    }

    return {
      budget,
      currency,
      remainingBudget,
      orders: selected
    };
  },

  async listForexRates(currency) {
    const where = currency ? { currency } : {};
    const rates = await prisma.forexRate.findMany({
      where,
      orderBy: { effectiveDate: 'desc' },
      take: 50
    });
    return rates;
  },

  async createForexRate(data, userId) {
    const rate = await prisma.forexRate.create({
      data: {
        currency: data.currency,
        rateToETB: data.rateToETB,
        source: data.source || 'MANUAL',
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
        createdBy: userId
      }
    });
    return rate;
  }
};

module.exports = procurementService;