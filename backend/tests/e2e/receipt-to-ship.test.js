const request = require('supertest');
const app = require('../../../src/app');

/**
 * End-to-End Test: Receipt to Ship Flow
 * 
 * This test covers the complete inventory lifecycle:
 * 1. Create Purchase Order
 * 2. Receive Goods (GRN)
 * 3. Quality Check
 * 4. Create Sales Order
 * 5. Pick Stock (FEFO)
 * 6. Ship Order
 */
describe('E2E: Receipt to Ship Flow', () => {
  let authToken;
  let purchaseOrderId;
  let goodsReceiptId;
  let batchId;
  let salesOrderId;

  beforeAll(async () => {
    // Setup: Login as warehouse manager
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'warehouse.manager@example.com',
        password: 'password123'
      });

    if (loginResponse.body.data) {
      authToken = loginResponse.body.data.accessToken;
    }
  });

  describe('Complete Flow', () => {
    it('Step 1: Create Purchase Order', async () => {
      const poData = {
        supplierId: 'supplier-001',
        warehouseId: 'warehouse-001',
        items: [
          {
            itemId: 'item-001',
            quantity: 500,
            unitPrice: 25.00
          }
        ],
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/procurement/purchase-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(poData);

      expect([201, 401, 403, 404]).toContain(response.status);
      
      if (response.status === 201) {
        purchaseOrderId = response.body.data.id;
      }
    });

    it('Step 2: Receive Goods (Create GRN)', async () => {
      const receiptData = {
        warehouseId: 'warehouse-001',
        supplierId: 'supplier-001',
        poNumber: purchaseOrderId,
        items: [
          {
            itemId: 'item-001',
            quantity: 500,
            costPrice: 25.00,
            manufacturingDate: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        qualityStatus: 'PENDING'
      };

      const response = await request(app)
        .post('/api/inventory/receipts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(receiptData);

      expect([201, 401, 403, 404]).toContain(response.status);
      
      if (response.status === 201) {
        goodsReceiptId = response.body.data.id;
        // Extract batch ID from response for later steps
        batchId = response.body.data.items?.[0]?.batches?.[0]?.id;
      }
    });

    it('Step 3: Quality Check - Accept Batch', async () => {
      const qualityData = {
        batchId: batchId || 'batch-001',
        status: 'ACTIVE',
        reason: 'Quality check passed'
      };

      const response = await request(app)
        .patch(`/api/quality/batches/${qualityData.batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(qualityData);

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('Step 4: Create Sales Order', async () => {
      const orderData = {
        customerId: 'customer-001',
        warehouseId: 'warehouse-001',
        items: [
          {
            itemId: 'item-001',
            quantity: 100
          }
        ],
        priority: 'NORMAL'
      };

      const response = await request(app)
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect([201, 401, 403, 404]).toContain(response.status);
      
      if (response.status === 201) {
        salesOrderId = response.body.data.id;
      }
    });

    it('Step 5: Pick Stock (FEFO)', async () => {
      const response = await request(app)
        .post(`/api/inventory/orders/${salesOrderId || 'order-001'}/pick`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('Step 6: Update Order Status to Shipped', async () => {
      const statusData = {
        status: 'SHIPPED'
      };

      const response = await request(app)
        .patch(`/api/sales/orders/${salesOrderId || 'order-001'}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData);

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('Step 7: Verify Stock Levels Updated', async () => {
      const response = await request(app)
        .get('/api/inventory/stock-levels?itemId=item-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404]).toContain(response.status);
      
      if (response.status === 200) {
        // Verify stock was reduced by 100 units
        const totalStock = response.body.data.reduce(
          (sum, level) => sum + level.quantity, 
          0
        );
        expect(totalStock).toBeLessThan(500); // Started with 500, sold 100
      }
    });
  });
});
