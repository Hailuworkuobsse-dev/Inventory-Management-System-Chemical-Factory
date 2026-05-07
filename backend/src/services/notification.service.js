const prisma = require('../utils/prisma');
const emailSender = require('../utils/emailSender');

/**
 * Notification Service
 * Push notifications (WebSocket/SSE) and email/SMS for expiry, stock-out, recalls (FR-013, FR-061, FR-069)
 */
class NotificationService {
  constructor() {
    // Store connected clients for WebSocket/SSE
    this.clients = new Set();
  }

  /**
   * Register a WebSocket/SSE client
   * @param {Object} client - Client connection
   */
  addClient(client) {
    this.clients.add(client);
  }

  /**
   * Remove a disconnected client
   * @param {Object} client - Client connection
   */
  removeClient(client) {
    this.clients.delete(client);
  }

  /**
   * Broadcast notification to all connected clients
   * @param {Object} notification - Notification payload
   */
  broadcast(notification) {
    const message = JSON.stringify(notification);
    
    this.clients.forEach(client => {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        } else if (client.sseSend) { // SSE
          client.sseSend(message);
        }
      } catch (error) {
        console.error('Failed to send notification to client:', error);
      }
    });
  }

  /**
   * Send notification to specific user(s)
   * @param {number[]} userIds - Target user IDs
   * @param {Object} notification - Notification payload
   */
  async notifyUsers(userIds, notification) {
    // In a real implementation, you'd filter clients by userId
    // For now, broadcast to all
    this.broadcast(notification);

    // Also send email if configured
    await this.sendEmailNotifications(userIds, notification);
  }

  /**
   * Send email notifications to users
   * @param {number[]} userIds - Target user IDs
   * @param {Object} notification - Notification payload
   */
  async sendEmailNotifications(userIds, notification) {
    try {
      // Get user emails
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { email: true, fullName: true },
      });

      const recipients = users.map(u => u.email);
      
      if (recipients.length > 0) {
        await emailSender.send({
          to: recipients,
          subject: notification.title || 'AIMS Notification',
          html: `<h2>${notification.title}</h2><p>${notification.message}</p>`,
        });
      }
    } catch (error) {
      console.error('Failed to send email notifications:', error);
    }
  }

  /**
   * Notify about expiring batches
   * @param {Array} batches - Batches expiring soon
   * @param {number} daysUntilExpiry - Days until expiry
   */
  async notifyExpiryAlert(batches, daysUntilExpiry) {
    const notification = {
      type: 'EXPIRY_ALERT',
      title: `Expiry Alert: ${batches.length} batches`,
      message: `${batches.length} batch(es) expiring in ${daysUntilExpiry} days`,
      data: { batches, daysUntilExpiry },
      timestamp: new Date().toISOString(),
    };

    // Get users with notification preference for expiry alerts
    const rolesToNotify = ['WAREHOUSE_MANAGER', 'QUALITY_MANAGER', 'ADMIN'];
    const users = await prisma.userRole.findMany({
      where: { role: { name: { in: rolesToNotify } } },
      include: { user: true },
    });

    const userIds = users.map(ur => ur.user.id);
    
    await this.notifyUsers(userIds, notification);

    // Also send detailed email
    const recipientEmails = users.map(ur => ur.user.email);
    await emailSender.sendExpiryAlert(recipientEmails, batches, daysUntilExpiry);
  }

  /**
   * Notify about stock-out risk
   * @param {Array} products - Products below safety stock
   */
  async notifyStockOutRisk(products) {
    const notification = {
      type: 'STOCK_OUT_RISK',
      title: `Stock-Out Risk: ${products.length} products`,
      message: `${products.length} product(s) below safety stock level`,
      data: { products },
      timestamp: new Date().toISOString(),
    };

    const rolesToNotify = ['PROCUREMENT_OFFICER', 'WAREHOUSE_MANAGER', 'ADMIN'];
    const users = await prisma.userRole.findMany({
      where: { role: { name: { in: rolesToNotify } } },
      include: { user: true },
    });

    const userIds = users.map(ur => ur.user.id);
    
    await this.notifyUsers(userIds, notification);

    const recipientEmails = users.map(ur => ur.user.email);
    await emailSender.sendStockOutAlert(recipientEmails, products);
  }

  /**
   * Notify about product recall
   * @param {Object} batch - Recalled batch
   * @param {string} reason - Recall reason
   */
  async notifyRecall(batch, reason) {
    const notification = {
      type: 'RECALL_ALERT',
      title: `URGENT: Product Recall - ${batch.batchNumber}`,
      message: `Batch ${batch.batchNumber} has been recalled: ${reason}`,
      data: { batch, reason },
      priority: 'HIGH',
      timestamp: new Date().toISOString(),
    };

    // Notify all relevant roles immediately
    const rolesToNotify = ['WAREHOUSE_MANAGER', 'QUALITY_MANAGER', 'SALES_REP', 'ADMIN'];
    const users = await prisma.userRole.findMany({
      where: { role: { name: { in: rolesToNotify } } },
      include: { user: true },
    });

    const userIds = users.map(ur => ur.user.id);
    
    await this.notifyUsers(userIds, notification);

    const recipientEmails = users.map(ur => ur.user.email);
    await emailSender.sendRecallAlert(recipientEmails, batch, reason);
  }

  /**
   * Notify about temperature excursion (IoT alert)
   * @param {Object} alert - Temperature excursion alert
   */
  async notifyTemperatureExcursion(alert) {
    const notification = {
      type: 'TEMPERATURE_EXCURSION',
      title: `Temperature Alert: ${alert.zoneName}`,
      message: `Temperature ${alert.value}°C ${alert.thresholdType === 'MAX' ? 'exceeds maximum' : 'below minimum'} (${alert.thresholdValue}°C)`,
      data: { alert },
      priority: 'HIGH',
      timestamp: new Date().toISOString(),
    };

    const rolesToNotify = ['WAREHOUSE_MANAGER', 'QUALITY_MANAGER'];
    const users = await prisma.userRole.findMany({
      where: { role: { name: { in: rolesToNotify } } },
      include: { user: true },
    });

    const userIds = users.map(ur => ur.user.id);
    
    await this.notifyUsers(userIds, notification);
  }

  /**
   * Notify about order status change
   * @param {Object} order - Sales order
   * @param {string} newStatus - New order status
   */
  async notifyOrderStatusChange(order, newStatus) {
    const notification = {
      type: 'ORDER_STATUS_UPDATE',
      title: `Order ${order.orderNumber} - ${newStatus}`,
      message: `Sales order ${order.orderNumber} status updated to ${newStatus}`,
      data: { order, newStatus },
      timestamp: new Date().toISOString(),
    };

    // Notify sales reps and warehouse staff
    const rolesToNotify = ['SALES_REP', 'WAREHOUSE_MANAGER'];
    const users = await prisma.userRole.findMany({
      where: { role: { name: { in: rolesToNotify } } },
      include: { user: true },
    });

    const userIds = users.map(ur => ur.user.id);
    
    await this.notifyUsers(userIds, notification);
  }
}

module.exports = new NotificationService();
