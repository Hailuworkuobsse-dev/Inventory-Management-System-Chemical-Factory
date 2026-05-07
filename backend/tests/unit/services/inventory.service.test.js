const { expect } = require('@jest/globals');

// Mock Prisma client
const mockPrisma = {
  stockLevel: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn()
  },
  goodsReceipt: {
    create: jest.fn()
  },
  $transaction: jest.fn(async (fn) => await fn(mockPrisma))
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../../src/services/audit.service', () => ({
  logAction: jest.fn().mockResolvedValue({})
}));

const inventoryService = require('../../../src/modules/inventory/inventory.service');
const { calculateMovingAverage, applyFEFO } = require('../../../src/modules/inventory/inventory.utils');

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockLevels', () => {
    it('should return stock levels with filters', async () => {
      const mockStock = [
        { id: '1', itemId: 'item-1', quantity: 100, warehouseId: 'wh-1' }
      ];
      
      mockPrisma.stockLevel.findMany.mockResolvedValue(mockStock);

      const result = await inventoryService.getStockLevels({ 
        warehouseId: 'wh-1', 
        itemId: 'item-1' 
      });

      expect(result).toEqual(mockStock);
      expect(mockPrisma.stockLevel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            warehouseId: 'wh-1',
            itemId: 'item-1'
          })
        })
      );
    });

    it('should return all stock levels when no filters provided', async () => {
      const mockStock = [
        { id: '1', itemId: 'item-1', quantity: 100 }
      ];
      
      mockPrisma.stockLevel.findMany.mockResolvedValue(mockStock);

      const result = await inventoryService.getStockLevels({});

      expect(result).toEqual(mockStock);
    });
  });

  describe('createGoodsReceipt', () => {
    it('should create a goods receipt and update stock levels', async () => {
      const receiptData = {
        warehouseId: 'wh-1',
        supplierId: 'sup-1',
        items: [
          {
            itemId: 'item-1',
            quantity: 50,
            costPrice: 10.00,
            manufacturingDate: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      const mockReceipt = {
        id: 'receipt-1',
        ...receiptData,
        items: receiptData.items.map(item => ({
          ...item,
          batches: [{ id: 'batch-1', quantity: item.quantity }]
        }))
      };

      mockPrisma.goodsReceipt.create.mockResolvedValue(mockReceipt);
      mockPrisma.$transaction.mockImplementation(async (fn) => await fn(mockPrisma));

      const result = await inventoryService.createGoodsReceipt(receiptData, 'user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('receipt-1');
      expect(mockPrisma.goodsReceipt.create).toHaveBeenCalled();
    });
  });
});

describe('Inventory Utils', () => {
  describe('calculateMovingAverage', () => {
    it('should calculate correct moving average', () => {
      const result = calculateMovingAverage(100, 10, 50, 12);
      // (100*10 + 50*12) / (100+50) = (1000 + 600) / 150 = 10.67
      expect(result).toBeCloseTo(10.67, 2);
    });

    it('should return current avg cost when no quantity added', () => {
      const result = calculateMovingAverage(100, 10, 0, 12);
      expect(result).toBe(10);
    });
  });

  describe('applyFEFO', () => {
    it('should consume batches in expiry date order', () => {
      const batches = [
        { id: 'b1', quantity: 50, costPrice: 10, expiresAt: new Date('2024-12-01') },
        { id: 'b2', quantity: 100, costPrice: 11, expiresAt: new Date('2024-06-01') },
        { id: 'b3', quantity: 75, costPrice: 9, expiresAt: new Date('2024-09-01') }
      ];

      const result = applyFEFO(batches, 80);

      // Should consume from b2 first (earliest expiry), then b3
      expect(result.consumed.length).toBeGreaterThan(0);
      expect(result.consumed[0].batchId).toBe('b2');
    });

    it('should throw error if insufficient stock', () => {
      const batches = [
        { id: 'b1', quantity: 50, costPrice: 10, expiresAt: new Date('2024-12-01') }
      ];

      expect(() => applyFEFO(batches, 100)).toThrow('Insufficient non-expired stock');
    });
  });
});
