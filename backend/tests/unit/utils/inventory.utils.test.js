const { selectBatchesFEFO, calculateFIFOCost, checkBatchExpiryStatus, validateStockQuantity } = require('../../../src/modules/inventory/inventory.utils');

describe('Inventory Utils - selectBatchesFEFO', () => {
  const mockBatches = [
    { id: '1', batchNumber: 'B001', expiryDate: new Date('2025-12-01'), quantity: 100, availableQuantity: 100 },
    { id: '2', batchNumber: 'B002', expiryDate: new Date('2025-06-01'), quantity: 50, availableQuantity: 50 },
    { id: '3', batchNumber: 'B003', expiryDate: new Date('2025-09-01'), quantity: 75, availableQuantity: 75 }
  ];

  it('should select batches in FEFO order', () => {
    const result = selectBatchesFEFO(mockBatches, 80);
    
    expect(result.length).toBe(2);
    expect(result[0].batchId).toBe('2'); // Earliest expiry
    expect(result[0].quantity).toBe(50);
    expect(result[1].batchId).toBe('3'); // Second earliest
    expect(result[1].quantity).toBe(30);
  });

  it('should throw error when insufficient stock', () => {
    expect(() => selectBatchesFEFO(mockBatches, 500)).toThrow('Insufficient stock');
  });

  it('should handle exact quantity match', () => {
    const result = selectBatchesFEFO(mockBatches, 225);
    expect(result.length).toBe(3);
    expect(result.reduce((sum, r) => sum + r.quantity, 0)).toBe(225);
  });
});

describe('Inventory Utils - calculateFIFOCost', () => {
  const mockLayers = [
    { id: '1', receivedDate: new Date('2025-01-01'), quantity: 100, costPrice: 10.00 },
    { id: '2', receivedDate: new Date('2025-02-01'), quantity: 50, costPrice: 12.00 },
    { id: '3', receivedDate: new Date('2025-03-01'), quantity: 75, costPrice: 11.00 }
  ];

  it('should calculate cost using FIFO method', () => {
    const result = calculateFIFOCost(mockLayers, 80);
    
    expect(result.totalCost).toBe(840); // 100 * 10 = 1000, but we only take 80
    expect(result.layers.length).toBe(1);
    expect(result.layers[0].quantityUsed).toBe(80);
  });

  it('should use multiple layers when needed', () => {
    const result = calculateFIFOCost(mockLayers, 120);
    
    expect(result.layers.length).toBe(2);
    expect(result.layers[0].quantityUsed).toBe(100);
    expect(result.layers[1].quantityUsed).toBe(20);
    expect(result.totalCost).toBe(1240); // 100*10 + 20*12
  });

  it('should throw error when insufficient stock layers', () => {
    expect(() => calculateFIFOCost(mockLayers, 500)).toThrow('Insufficient stock layers');
  });
});

describe('Inventory Utils - checkBatchExpiryStatus', () => {
  it('should identify expired batch', () => {
    const pastDate = new Date('2024-01-01');
    const result = checkBatchExpiryStatus(pastDate);
    
    expect(result.isExpired).toBe(true);
    expect(result.status).toBe('EXPIRED');
    expect(result.daysRemaining).toBeLessThan(0);
  });

  it('should identify expiring soon batch', () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const result = checkBatchExpiryStatus(futureDate, 90);
    
    expect(result.isExpiringSoon).toBe(true);
    expect(result.status).toBe('EXPIRING_SOON');
  });

  it('should identify OK batch', () => {
    const farFutureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days from now
    const result = checkBatchExpiryStatus(farFutureDate, 90);
    
    expect(result.isExpired).toBe(false);
    expect(result.isExpiringSoon).toBe(false);
    expect(result.status).toBe('OK');
  });
});

describe('Inventory Utils - validateStockQuantity', () => {
  it('should allow valid stock addition', () => {
    const result = validateStockQuantity(100, 50);
    
    expect(result.isValid).toBe(true);
    expect(result.newStock).toBe(150);
    expect(result.error).toBeNull();
  });

  it('should allow valid stock removal', () => {
    const result = validateStockQuantity(100, -30);
    
    expect(result.isValid).toBe(true);
    expect(result.newStock).toBe(70);
  });

  it('should reject negative stock when not allowed', () => {
    const result = validateStockQuantity(50, -100, false);
    
    expect(result.isValid).toBe(false);
    expect(result.newStock).toBeNull();
    expect(result.error).toContain('Insufficient stock');
  });

  it('should allow negative stock when explicitly permitted', () => {
    const result = validateStockQuantity(50, -100, true);
    
    expect(result.isValid).toBe(true);
    expect(result.newStock).toBe(-50);
  });
});
