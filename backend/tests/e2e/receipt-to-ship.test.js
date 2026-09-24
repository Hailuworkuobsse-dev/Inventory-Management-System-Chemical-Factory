const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/utils/prisma');

describe('E2E Tests - Receipt to Ship Workflow', () => {
  let authToken;
  let productId;
  let batchId;
  let purchaseOrderId;
  let salesOrderId;

  const testUser = {
    email: 'e2e@example.com',
    password: 'E2ETest123!@#',
    firstName: 'E2E',
    lastName: 'Test'
  };

  const productData = {
    sku: 'E2E-SKU-001',
    inn: 'Test INN',
    brandName: 'Test Brand',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: 'Test Pharma',
    countryOfOrigin: 'Ethiopia'
  };

  beforeAll(async () => {
    // Register and login
    await request(app).post('/api/v1/auth/register').send(testUser);
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.salesOrder.deleteMany({ where: { orderNumber: { startsWith: 'E2E-' } } });
    await prisma.purchaseOrder.deleteMany({ where: { orderNumber: { startsWith: 'E2E-' } } });
    await prisma.batch.deleteMany({ where: { batchNumber: { startsWith: 'E2E-' } } });
    await prisma.product.deleteMany({ where: { sku: productData.sku } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('Complete Procurement to Sales Workflow', () => {
    it('should create a product', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      productId = response.body.data.id;
    });

    it('should create a purchase order', async () => {
      const response = await request(app)
        .post('/api/v1/procurement/purchase-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          supplierId: 1, // Assuming default supplier exists
          items: [{
            productId,
            quantity: 1000,
            unitPrice: 10.00
          }]
        });

      expect(response.status).toBe(201);
      purchaseOrderId = response.body.data.id;
    });

    it('should receive goods against purchase order', async () => {
      const response = await request(app)
        .post(`/api/v1/procurement/purchase-orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{
            itemId: 1,
            quantityReceived: 1000,
            batchNumber: 'E2E-BATCH-001',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            warehouseId: 1
          }]
        });

      expect(response.status).toBe(200);
      batchId = response.body.data.batches[0].id;
    });

    it('should verify stock was created', async () => {
      const response = await request(app)
        .get('/api/v1/inventory/stock')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should create a sales order', async () => {
      const response = await request(app)
        .post('/api/v1/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 1, // Assuming default customer exists
          items: [{
            productId,
            quantity: 100,
            unitPrice: 15.00
          }]
        });

      expect(response.status).toBe(201);
      salesOrderId = response.body.data.id;
    });

    it('should fulfill the sales order', async () => {
      const response = await request(app)
        .post(`/api/v1/sales/orders/${salesOrderId}/fulfill`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          warehouseId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('FULFILLED');
    });

    it('should verify stock was reduced', async () => {
      const response = await request(app)
        .get('/api/v1/inventory/stock')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId });

      expect(response.status).toBe(200);
      const stockItem = response.body.data.find(s => s.productId === productId);
      expect(parseFloat(stockItem.quantity)).toBeLessThan(1000);
    });

    it('should verify stock ledger entries were created', async () => {
      const response = await request(app)
        .get('/api/v1/inventory/ledger')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(1); // At least receipt and issue
      
      const receipt = response.body.data.find(l => l.movementType === 'RECEIPT');
      const issue = response.body.data.find(l => l.movementType === 'ISSUE');
      
      expect(receipt).toBeDefined();
      expect(issue).toBeDefined();
    });
  });
});
