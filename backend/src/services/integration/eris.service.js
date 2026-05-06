const axios = require('axios');
const config = require('../../config');
const AppError = require('../../utils/appError');

/**
 * Format and export data for EFDA's eRIS system (FR-002)
 * @param {Object} options - Export options
 * @param {string} [options.dateFrom] - Start date for export
 * @param {string} [options.dateTo] - End date for export
 * @param {string} [options.format] - Export format (CSV, XML, JSON)
 * @returns {Promise<Object>} Export result with file URL or data
 */
const exportToERIS = async ({ dateFrom, dateTo, format = 'CSV' }) => {
  const prisma = require('../../utils/prisma');
  
  try {
    // Fetch all required data for eRIS
    const [batches, receipts, stockMovements] = await Promise.all([
      prisma.batch.findMany({
        where: {
          createdAt: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        },
        include: {
          product: true,
          certificates: true,
          labTests: true
        }
      }),
      prisma.receipt.findMany({
        where: {
          receivedDate: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          purchaseOrder: true
        }
      }),
      prisma.stockLedger.findMany({
        where: {
          timestamp: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        },
        include: {
          stock: {
            include: {
              batch: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        take: 10000
      })
    ]);

    // Format data according to eRIS specifications
    const eRISData = {
      exportDate: new Date().toISOString(),
      dateRange: { from: dateFrom, to: dateTo },
      batches: batches.map(b => ({
        batchNumber: b.batchNumber,
        productName: b.product.brandName || b.product.inn,
        sku: b.product.sku,
        manufactureDate: b.manufactureDate.toISOString(),
        expiryDate: b.expiryDate.toISOString(),
        status: b.status,
        certificates: b.certificates.map(c => ({
          type: c.type,
          number: c.number,
          issueDate: c.issueDate?.toISOString(),
          expiryDate: c.expiryDate?.toISOString()
        })),
        labTests: b.labTests.map(t => ({
          testType: t.testType,
          status: t.status,
          resultValue: t.resultValue,
          performedDate: t.performedDate?.toISOString()
        }))
      })),
      receipts: receipts.map(r => ({
        receiptNumber: r.receiptNumber,
        receivedDate: r.receivedDate.toISOString(),
        importPermit: r.iImportPermit,
        status: r.status,
        items: r.items.map(i => ({
          productName: i.product.brandName || i.product.inn,
          sku: i.product.sku,
          batchNumber: i.batchNumber,
          quantityReceived: i.quantityReceived.toString(),
          quantityAccepted: i.quantityAccepted?.toString(),
          unitCost: i.unitCost.toString(),
          currency: i.currency
        }))
      })),
      stockMovements: stockMovements.map(m => ({
        timestamp: m.timestamp.toISOString(),
        movementType: m.movementType,
        batchNumber: m.stock.batch.batchNumber,
        productName: m.stock.batch.product.brandName || m.stock.batch.product.inn,
        quantityChange: m.quantityChange.toString(),
        reason: m.reason
      }))
    };

    // If eRIS API is configured, send data
    if (config.ERIS_API_URL && config.ERIS_API_KEY) {
      try {
        const response = await axios.post(
          `${config.ERIS_API_URL}/api/v1/submission`,
          eRISData,
          {
            headers: {
              'Authorization': `Bearer ${config.ERIS_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return {
          success: true,
          submissionId: response.data?.submissionId,
          timestamp: new Date().toISOString(),
          recordCount: {
            batches: batches.length,
            receipts: receipts.length,
            movements: stockMovements.length
          }
        };
      } catch (apiError) {
        console.error('eRIS API submission failed:', apiError.message);
        // Continue to return formatted data even if API fails
      }
    }

    // Return formatted data for manual export
    return {
      success: true,
      data: eRISData,
      format,
      timestamp: new Date().toISOString(),
      recordCount: {
        batches: batches.length,
        receipts: receipts.length,
        movements: stockMovements.length
      },
      message: 'Data formatted for eRIS export. Download or submit manually.'
    };
  } catch (error) {
    console.error('Failed to export to eRIS:', error);
    throw new AppError('Failed to generate eRIS export', 500, 'ERIS_EXPORT_FAILED');
  }
};

/**
 * Generate tax valuation report for Ministry of Revenue
 * @param {Object} options - Report options
 * @param {string} options.periodStart - Start of reporting period
 * @param {string} options.periodEnd - End of reporting period
 * @returns {Promise<Object>} Tax report data
 */
const generateTaxReport = async ({ periodStart, periodEnd }) => {
  const prisma = require('../../utils/prisma');

  try {
    // Get all stock movements in the period
    const movements = await prisma.stockLedger.findMany({
      where: {
        timestamp: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd)
        }
      },
      include: {
        stock: {
          include: {
            batch: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    // Calculate taxable values
    const taxData = movements.reduce((acc, m) => {
      const key = `${m.stock.batch.product.sku}-${m.movementType}`;
      if (!acc[key]) {
        acc[key] = {
          sku: m.stock.batch.product.sku,
          productName: m.stock.batch.product.brandName || m.stock.batch.product.inn,
          movementType: m.movementType,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      acc[key].totalQuantity += parseFloat(m.quantityChange);
      acc[key].totalValue += parseFloat(m.quantityChange) * parseFloat(m.stock.costPrice);
      return acc;
    }, {});

    return {
      success: true,
      period: { start: periodStart, end: periodEnd },
      generatedAt: new Date().toISOString(),
      data: Object.values(taxData),
      summary: {
        totalMovements: movements.length,
        uniqueProducts: Object.keys(taxData).length
      }
    };
  } catch (error) {
    console.error('Failed to generate tax report:', error);
    throw new AppError('Failed to generate tax valuation report', 500, 'TAX_REPORT_FAILED');
  }
};

module.exports = {
  exportToERIS,
  generateTaxReport
};
