const nodemailer = require('nodemailer');
const config = require('../config');
const AppError = require('./appError');

/**
 * Email Sender Service
 * Wrapper for sending alert emails (FR-061)
 */
class EmailSender {
  constructor() {
    this.transporter = null;
    this.initialised = false;
  }

  /**
   * Initialise email transporter
   */
  init() {
    if (this.initialised) return;

    // Configure based on environment
    if (config.SMTP_HOST && config.SMTP_PORT) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE === 'true',
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });
      this.initialised = true;
    } else {
      console.warn('SMTP not configured. Emails will be logged to console.');
      this.initialised = true;
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @param {string} [options.text] - Plain text body
   * @returns {Promise<Object>} - Send result
   */
  async send(options) {
    const { to, subject, html, text } = options;

    if (!this.initialised) {
      this.init();
    }

    const mailOptions = {
      from: config.SMTP_FROM || 'AIMS <noreply@aims.et>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
    };

    // If SMTP not configured, log to console
    if (!this.transporter) {
      console.log('=== EMAIL (SIMULATED) ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', mailOptions.html || mailOptions.text);
      console.log('========================');
      return { messageId: 'simulated-' + Date.now() };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw AppError.internal('Failed to send email notification');
    }
  }

  /**
   * Send expiry alert email
   * @param {string[]} recipients - List of recipient emails
   * @param {Array} batches - Batches expiring soon
   * @param {number} daysUntilExpiry - Days until expiry
   */
  async sendExpiryAlert(recipients, batches, daysUntilExpiry) {
    const subject = `⚠️ Expiry Alert: ${batches.length} batches expiring in ${daysUntilExpiry} days`;
    
    const html = `
      <h2>Expiry Alert Notification</h2>
      <p>The following batches are expiring within ${daysUntilExpiry} days:</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Product</th>
            <th>Expiry Date</th>
            <th>Quantity</th>
            <th>Warehouse</th>
          </tr>
        </thead>
        <tbody>
          ${batches.map(batch => `
            <tr>
              <td>${batch.batchNumber}</td>
              <td>${batch.productName}</td>
              <td>${batch.expiryDate}</td>
              <td>${batch.quantity}</td>
              <td>${batch.warehouseName}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Please take appropriate action.</p>
      <p><small>This is an automated message from AIMS.</small></p>
    `;

    return await this.send({ to: recipients, subject, html });
  }

  /**
   * Send stock-out alert email
   * @param {string[]} recipients - List of recipient emails
   * @param {Array} products - Products below safety stock
   */
  async sendStockOutAlert(recipients, products) {
    const subject = `🚨 Stock-Out Alert: ${products.length} products below safety stock`;
    
    const html = `
      <h2>Stock-Out Risk Alert</h2>
      <p>The following products are below their safety stock levels:</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Current Stock</th>
            <th>Safety Stock</th>
            <th>Warehouse</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td>${product.productName}</td>
              <td>${product.sku}</td>
              <td>${product.currentStock}</td>
              <td>${product.safetyStock}</td>
              <td>${product.warehouseName}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Please initiate procurement immediately.</p>
      <p><small>This is an automated message from AIMS.</small></p>
    `;

    return await this.send({ to: recipients, subject, html });
  }

  /**
   * Send recall alert email
   * @param {string[]} recipients - List of recipient emails
   * @param {Object} batch - Recalled batch information
   * @param {string} reason - Recall reason
   */
  async sendRecallAlert(recipients, batch, reason) {
    const subject = `🔴 URGENT: Product Recall - ${batch.batchNumber}`;
    
    const html = `
      <h2>Product Recall Notice</h2>
      <p><strong>Batch Number:</strong> ${batch.batchNumber}</p>
      <p><strong>Product:</strong> ${batch.productName}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Action Required:</strong> Immediately quarantine all stock and halt distribution.</p>
      <p><small>This is an automated message from AIMS.</small></p>
    `;

    return await this.send({ to: recipients, subject, html });
  }
}

module.exports = new EmailSender();
