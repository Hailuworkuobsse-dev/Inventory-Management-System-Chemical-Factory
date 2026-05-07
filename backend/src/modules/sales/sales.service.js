const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/customErrors');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Create a customer
 */
async function createCustomer(data, userId) {
  const customer = await prisma.customer.create({
    data,
    include: { contacts: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'CUSTOMER_CREATED',
    entityType: 'Customer',
    entityId: customer.id,
    details: { name: customer.name }
  });

  return customer;
}

/**
 * Create a sales order
 */
async function createSalesOrder(data, userId) {
  const { customerId, warehouseId, items, priority, notes } = data;

  return prisma.$transaction(async (tx) => {
    // Calculate total value (would need item prices from DB in real scenario)
    const totalValue = 0; // Placeholder

    const order = await tx.salesOrder.create({
      data: {
        customerId,
        warehouseId,
        status: 'PENDING',
        priority,
        notes,
        totalValue,
        createdBy: userId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true, customer: true }
    });

    await auditService.logAction(tx, {
      userId,
      action: 'SALES_ORDER_CREATED',
      entityType: 'SalesOrder',
      entityId: order.id,
      details: { orderId: order.orderNumber }
    });

    return order;
  });
}

/**
 * Update sales order status
 */
async function updateOrderStatus(orderId, status, userId) {
  const order = await prisma.salesOrder.update({
    where: { id: orderId },
    data: { status },
    include: { items: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'SALES_ORDER_STATUS_UPDATED',
    entityType: 'SalesOrder',
    entityId: orderId,
    details: { status }
  });

  return order;
}

/**
 * Create a sales return
 */
async function createReturn(data, userId) {
  const { orderId, items, returnReason, notes } = data;

  return prisma.$transaction(async (tx) => {
    // Verify order exists and is delivered
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'DELIVERED') {
      throw new AppError('Can only return delivered orders', 400);
    }

    // Create return record
    const returnRecord = await tx.salesReturn.create({
      data: {
        orderId,
        returnReason,
        notes,
        status: 'PENDING',
        processedBy: userId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            reason: item.reason
          }))
        }
      },
      include: { items: true }
    });

    // Return items to inventory (simplified - would add back to stock)
    // This would create new batch or add to existing based on condition

    await auditService.logAction(tx, {
      userId,
      action: 'SALES_RETURN_CREATED',
      entityType: 'SalesReturn',
      entityId: returnRecord.id,
      details: { returnReason }
    });

    return returnRecord;
  });
}

/**
 * Get order history for a customer
 */
async function getCustomerOrders(customerId, status) {
  const where = { customerId };
  if (status) where.status = status;

  return prisma.salesOrder.findMany({
    where,
    include: {
      items: { include: { item: true } },
      warehouse: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  createCustomer,
  createSalesOrder,
  updateOrderStatus,
  createReturn,
  getCustomerOrders
};
