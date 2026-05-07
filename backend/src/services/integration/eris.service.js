const prisma = require('../../utils/prisma');
const fs = require('fs').promises;
const path = require('path');
const AppError = require('../../utils/appError');

/**
 * eRIS Integration Service
 * Formats data and exports for EFDA's eRIS system (FR-002)
 */
class ErisService {
  /**
   * Generate eRIS export file
   * @param {Object} options - Export options
   * @param {string} options.format - Export format (JSON, XML, CSV)
   * @param {Date} [options.dateFrom] - Start date filter
   * @param {Date} [options.dateTo] - End date filter
   * @returns {Promise<Object>} - Export result with file URL
   */
  async generateExport(options = {}) {
    const { format = 'JSON', dateFrom, dateTo } = options;
    
    // Gather all required data for eRIS
    const data = await this.gatherErisData(dateFrom, dateTo);
    
    // Format according to eRIS specification
    let formattedData;
    let extension;
    
    switch (format.toUpperCase()) {
      case 'XML':
        formattedData = this.formatAsXML(data);
        extension = 'xml';
        break;
      case 'CSV':
        formattedData = this.formatAsCSV(data);
        extension = 'csv';
        break;
      default:
        formattedData = JSON.stringify(data, null, 2);
        extension = 'json';
    }
    
    // Save to exports directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `eris_export_${timestamp}.${extension}`;
    const filepath = path.join(process.cwd(), 'exports', filename);
    
    // Ensure exports directory exists
    try {
      await fs.mkdir(path.join(process.cwd(), 'exports'), { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    await fs.writeFile(filepath, formattedData);
    
    // Record export in database
    const exportRecord = await prisma.regulatoryExport.create({
      data: {
        exportType: 'ERIS',
        format: format.toUpperCase(),
        filePath: `/exports/${filename}`,
        status: 'COMPLETED',
        dateRange: {
          start: dateFrom || null,
          end: dateTo || null,
        },
      },
    });
    
    return {
      id: exportRecord.id,
      filename,
      url: `/exports/${filename}`,
      generatedAt: new Date(),
    };
  }
  
  /**
   * Gather all data required for eRIS reporting
   * @param {Date} dateFrom - Start date
   * @param {Date} dateTo - End date
   * @returns {Promise<Object>} - Aggregated data
   */
  async gatherErisData(dateFrom, dateTo) {
    const now = new Date();
    const from = dateFrom || new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = dateTo || now;
    
    // Get all stock movements
    const stockMovements = await prisma.stockLedger.findMany({
      where: {
        timestamp: { gte: from, lte: to },
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            inn: true,
            strength: true,
            dosageForm: true,
            manufacturerName: true,
          },
        },
        batch: {
          select: {
            batchNumber: true,
            expiryDate: true,
            importPermitNo: true,
          },
        },
        warehouse: {
          select: {
            name: true,
            licenseNo: true,
          },
        },
      },
    });
    
    // Get all receipts
    const receipts = await prisma.goodsReceipt.findMany({
      where: {
        receivedDate: { gte: from, lte: to },
      },
      include: {
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
        warehouse: true,
      },
    });
    
    // Get all sales/dispatches
    const sales = await prisma.salesOrder.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { in: ['SHIPPED', 'DELIVERED'] },
      },
      include: {
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
        customer: true,
      },
    });
    
    return {
      exportDate: now.toISOString(),
      reportingPeriod: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      summary: {
        totalMovements: stockMovements.length,
        totalReceipts: receipts.length,
        totalSales: sales.length,
      },
      stockMovements: stockMovements.map(m => ({
        movementId: m.id,
        type: m.movementType,
        productId: m.product.sku,
        productName: m.product.name,
        batchNumber: m.batch?.batchNumber,
        quantity: m.quantity,
        unitCost: m.unitCostETB,
        warehouse: m.warehouse.name,
        timestamp: m.timestamp.toISOString(),
        reference: m.reference,
      })),
      receipts: receipts.map(r => ({
        receiptId: r.id,
        receiptNumber: r.receiptNumber,
        warehouse: r.warehouse.name,
        receivedDate: r.receivedDate.toISOString(),
        items: r.items.map(i => ({
          sku: i.product.sku,
          batchNumber: i.batch?.batchNumber,
          quantity: i.quantityReceived,
          unitCost: i.unitCost,
          currency: i.currency,
        })),
      })),
      sales: sales.map(s => ({
        orderId: s.id,
        orderNumber: s.orderNumber,
        customer: s.customer?.name,
        orderDate: s.createdAt.toISOString(),
        items: s.items.map(i => ({
          sku: i.product.sku,
          batchNumber: i.batch?.batchNumber,
          quantity: i.quantity,
        })),
      })),
    };
  }
  
  /**
   * Format data as XML
   * @param {Object} data - Data to format
   * @returns {string} - XML string
   */
  formatAsXML(data) {
    // Simplified XML formatting
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<eRISExport>\n';
    xml += `  <exportDate>${data.exportDate}</exportDate>\n`;
    xml += `  <reportingPeriod>\n`;
    xml += `    <from>${data.reportingPeriod.from}</from>\n`;
    xml += `    <to>${data.reportingPeriod.to}</to>\n`;
    xml += `  </reportingPeriod>\n`;
    xml += `  <summary>\n`;
    xml += `    <totalMovements>${data.summary.totalMovements}</totalMovements>\n`;
    xml += `    <totalReceipts>${data.summary.totalReceipts}</totalReceipts>\n`;
    xml += `    <totalSales>${data.summary.totalSales}</totalSales>\n`;
    xml += `  </summary>\n`;
    xml += '</eRISExport>';
    
    return xml;
  }
  
  /**
   * Format data as CSV
   * @param {Object} data - Data to format
   * @returns {string} - CSV string
   */
  formatAsCSV(data) {
    let csv = 'MovementID,Type,ProductSKU,ProductName,BatchNumber,Quantity,UnitCost,Warehouse,Timestamp\n';
    
    data.stockMovements.forEach(m => {
      csv += `${m.movementId},${m.type},${m.productId},"${m.productName}",${m.batchNumber},${m.quantity},${m.unitCost},"${m.warehouse}",${m.timestamp}\n`;
    });
    
    return csv;
  }
}

module.exports = new ErisService();
