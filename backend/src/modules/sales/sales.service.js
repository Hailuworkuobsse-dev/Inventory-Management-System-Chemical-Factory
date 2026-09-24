const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');

const salesService = {
  async listSalesOrders(query) {
    const { status, customerId, dateFrom, dateTo, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = parseInt(customerId);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: true, batch: true } },
          customer: true,
          warehouse: true,
          returns: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.salesOrder.count({ where })
    ]);

    return {
      items: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  },

  async getSalesOrder(id) {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true, batch: true } },
        customer: true,
        warehouse: true,
        returns: {
          include: {
            items: true
          }
        },
        shipments: true
      }
    });

    if (!order) {
      throw new AppError('Sales order not found', 404, 'NOT_FOUND');
    }

    return order;
  },

  async createSalesOrder(data, userId) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
    }

    const order = await prisma.salesOrder.create({
      data: {
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0
          }))
        },
        createdBy: userId
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        warehouse: true
      }
    });

    return order;
  },

  async updateSalesOrderStatus(id, status, trackingNumber, userId) {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      throw new AppError('Sales order not found', 404, 'NOT_FOUND');
    }

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    }

    const updated = await prisma.salesOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        items: { include: { product: true } },
        customer: true
      }
    });

    return updated;
  },

  async createReturn(orderId, data, userId) {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: true }
    });

    if (!order) {
      throw new AppError('Sales order not found', 404, 'NOT_FOUND');
    }

    const ret = await prisma.return.create({
      data: {
        salesOrderId: parseInt(orderId),
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            batchId: item.batchId ? parseInt(item.batchId) : null,
            quantity: item.quantity,
            reason: item.reason || 'Customer return'
          }))
        },
        createdBy: userId
      },
      include: {
        items: { include: { product: true } },
        salesOrder: true
      }
    });

    return ret;
  },

  async getReturn(returnId) {
    const ret = await prisma.return.findUnique({
      where: { id: parseInt(returnId) },
      include: {
        items: { include: { product: true } },
        salesOrder: true
      }
    });

    if (!ret) {
      throw new AppError('Return not found', 404, 'NOT_FOUND');
    }

    return ret;
  },

  async updateReturnDisposition(returnId, items, userId) {
    const ret = await prisma.return.findUnique({
      where: { id: parseInt(returnId) },
      include: { items: true }
    });

    if (!ret) {
      throw new AppError('Return not found', 404, 'NOT_FOUND');
    }

    // Update disposition for each return item
    for (const item of items) {
      await prisma.returnItem.update({
        where: { id: parseInt(item.returnItemId) },
        data: {
          disposition: item.disposition,
          disposedAt: new Date()
        }
      });
    }

    // Update return status to COMPLETED
    const updated = await prisma.return.update({
      where: { id: parseInt(returnId) },
      data: { status: 'COMPLETED' },
      include: {
        items: { include: { product: true } },
        salesOrder: true
      }
    });

    return updated;
  },

  async listReturns(query) {
    const { status, orderId, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (orderId) where.salesOrderId = parseInt(orderId);

    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: true } },
          salesOrder: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.return.count({ where })
    ]);

    return {
      items: returns,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }
};

module.exports = salesService;