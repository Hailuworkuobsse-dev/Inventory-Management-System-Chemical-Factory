const { runExpiryAlertJob } = require('../../../src/jobs/expiryAlertJob');
const prisma = require('../../../src/utils/prisma');

// Mock dependencies
jest.mock('../../../src/utils/prisma');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/utils/emailSender');

describe('Expiry Alert Job', () => {
  const mockNow = new Date('2025-05-06');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(mockNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runExpiryAlertJob', () => {
    it('should return success when no batches nearing expiry', async () => {
      prisma.batch.findMany.mockResolvedValue([]);

      const result = await runExpiryAlertJob();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(prisma.batch.findMany).toHaveBeenCalled();
    });

    it('should process and categorize expiring batches', async () => {
      const mockBatches = [
        {
          id: '1',
          batchNumber: 'B001',
          expiryDate: new Date('2025-05-20'), // 14 days - critical
          status: 'RELEASED',
          product: { brandName: 'Medicine A', sku: 'SKU001' },
          stocks: [{ quantity: 100, warehouse: { name: 'WH1' } }]
        },
        {
          id: '2',
          batchNumber: 'B002',
          expiryDate: new Date('2025-07-01'), // 56 days - warning
          status: 'RELEASED',
          product: { brandName: 'Medicine B', sku: 'SKU002' },
          stocks: [{ quantity: 50, warehouse: { name: 'WH2' } }]
        }
      ];

      prisma.batch.findMany.mockResolvedValue(mockBatches);

      const result = await runExpiryAlertJob();

      expect(result.success).toBe(true);
      expect(result.counts.critical).toBe(1);
      expect(result.counts.warning).toBe(1);
      expect(result.counts.notice).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      prisma.batch.findMany.mockRejectedValue(new Error('Database error'));

      await expect(runExpiryAlertJob()).rejects.toThrow('Database error');
    });
  });
});
