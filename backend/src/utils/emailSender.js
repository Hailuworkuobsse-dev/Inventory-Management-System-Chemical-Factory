const nodemailer = require('nodemailer');
const config = require('../config');
const AppError = require('./appError');

// Create transporter
const createTransporter = () => {
  if (!config.SMTP_HOST) {
    console.warn('SMTP configuration not found. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465, // true for 465, false for other ports
    auth: config.SMTP_USER ? {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    } : undefined,
    from: config.EMAIL_FROM
  });
};

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 * @param {string} [options.text] - Plain text body (optional)
 * @returns {Promise<Object>} Nodemailer send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email transport not configured. Skipping email send.');
    return { messageId: 'mock-' + Date.now(), skipped: true };
  }

  try {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new AppError('Failed to send email notification', 500, 'EMAIL_SEND_FAILED');
  }
};

/**
 * Send expiry alert email
 * @param {Array} expiringBatches - Array of batches nearing expiry
 * @param {string} recipientEmail - Recipient email
 */
const sendExpiryAlert = async (expiringBatches, recipientEmail) => {
  const subject = `⚠️ Expiry Alert - ${expiringBatches.length} Batches Nearing Expiry`;
  
  const html = `
    <h2>Expiry Alert Notification</h2>
    <p>The following batches are nearing their expiry dates:</p>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Product</th>
          <th>Batch Number</th>
          <th>Expiry Date</th>
          <th>Quantity</th>
          <th>Days Remaining</th>
        </tr>
      </thead>
      <tbody>
        ${expiringBatches.map(batch => `
          <tr>
            <td>${batch.productName}</td>
            <td>${batch.batchNumber}</td>
            <td>${new Date(batch.expiryDate).toLocaleDateString()}</td>
            <td>${batch.quantity}</td>
            <td>${batch.daysRemaining}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Please take appropriate action.</p>
  `;

  return sendEmail({ to: recipientEmail, subject, html });
};

/**
 * Send stock-out alert email
 * @param {Array} lowStockItems - Array of items below safety stock
 * @param {string} recipientEmail - Recipient email
 */
const sendStockOutAlert = async (lowStockItems, recipientEmail) => {
  const subject = `🚨 Stock Alert - ${lowStockItems.length} Items Below Safety Stock`;
  
  const html = `
    <h2>Stock-Out Risk Alert</h2>
    <p>The following items are below their safety stock levels:</p>
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
        ${lowStockItems.map(item => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.sku}</td>
            <td>${item.currentStock}</td>
            <td>${item.safetyStock}</td>
            <td>${item.warehouseName}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Immediate replenishment is recommended.</p>
  `;

  return sendEmail({ to: recipientEmail, subject, html });
};

/**
 * Send cold chain excursion alert
 * @param {Object} excursion - Excursion details
 * @param {string} recipientEmail - Recipient email
 */
const sendColdChainExcursionAlert = async (excursion, recipientEmail) => {
  const subject = `🌡️ Cold Chain Excursion Alert - ${excursion.batchNumber}`;
  
  const html = `
    <h2>Cold Chain Excursion Alert</h2>
    <p>A temperature excursion has been detected:</p>
    <ul>
      <li><strong>Batch:</strong> ${excursion.batchNumber}</li>
      <li><strong>Product:</strong> ${excursion.productName}</li>
      <li><strong>Temperature:</strong> ${excursion.temperature}°C</li>
      <li><strong>Threshold:</strong> ${excursion.minTemp}°C - ${excursion.maxTemp}°C</li>
      <li><strong>Location:</strong> ${excursion.warehouseName}, ${excursion.zoneType}</li>
      <li><strong>Time:</strong> ${new Date(excursion.timestamp).toLocaleString()}</li>
    </ul>
    <p>Immediate quality review is required.</p>
  `;

  return sendEmail({ to: recipientEmail, subject, html });
};

module.exports = {
  sendEmail,
  sendExpiryAlert,
  sendStockOutAlert,
  sendColdChainExcursionAlert
};
