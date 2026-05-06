# API Contract Design – AIMS  
**Advanced Inventory Management System**  
*Version 1.0 | Base URL: `https://api.aims.et/api/v1`*

This document defines the complete RESTful API contract that fulfils all 90 functional requirements (FR‑001 to FR‑090). Every endpoint is secured with JWT (Bearer token) and role‑based permissions. The request/response format is JSON. A standard response envelope is used for all endpoints:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "errors": null
}
```

In case of an error, `success` is `false`, `data` is `null`, and `errors` contains an array of error objects with `code` and `description`.

---

## 1. Authentication & Session

| Method | Endpoint               | Description                              | Request Body / Query                    | Response Data                              | Requirements |
|--------|------------------------|------------------------------------------|-----------------------------------------|--------------------------------------------|--------------|
| POST   | `/auth/login`          | User login                               | `{ "email": string, "password": string }` | `{ "accessToken": string, "user": { id, name, roles } }` (Refresh token in httpOnly cookie) | – |
| POST   | `/auth/refresh`        | Refresh access token                     | (cookie automatically sent)            | `{ "accessToken": string }`               | – |
| POST   | `/auth/logout`         | Invalidate refresh token                 | –                                       | –                                          | – |

---

## 2. Inventory & Stock Management

### 2.1 Stock Visibility & Query (FR‑033, FR‑038, FR‑053)

| Method | Endpoint            | Description                               | Parameters / Body                         | Response Data                               |
|--------|---------------------|-------------------------------------------|-------------------------------------------|---------------------------------------------|
| GET    | `/stock`            | List stock across warehouses              | Query: `?warehouseId, productId, batchId, expiringBefore, zoneType, binLabel, page, limit` | `{ items: StockItem[], total, page, limit }` |
| GET    | `/stock/:stockId`   | Get a single stock record details         | –                                         | `StockItem` with bin, batch, product info   |

**StockItem Entity:**
```json
{
  "id": 123,
  "warehouseId": 1,
  "warehouseName": "Addis Central",
  "zoneType": "AMBIENT",
  "binLabel": "A-01-02-03",
  "batch": {
    "id": 45,
    "batchNumber": "BN-2024-001",
    "expiryDate": "2026-01-01",
    "status": "RELEASED"
  },
  "product": {
    "id": 10,
    "sku": "PARA-500",
    "inn": "Paracetamol",
    "name": "Paracetamol 500mg"
  },
  "quantity": 1500,
  "reservedQty": 200,
  "unitCostETB": 2.50,
  "lastUpdated": "2025-12-01T08:00:00Z"
}
```

### 2.2 Goods Receipt (FR‑009, FR‑029, FR‑030)

| Method | Endpoint            | Description                           | Request Body                                     | Response Data           |
|--------|---------------------|---------------------------------------|--------------------------------------------------|-------------------------|
| POST   | `/receipts`         | Create a new inbound receipt          | `{ warehouseId, purchaseOrderItemId?, iImportPermit, items: [{ productId, batchNumber, manufactureDate, expiryDate, quantity, unitCost, currency, labTestRequired }] }` | `Receipt` object       |
| GET    | `/receipts/:id`     | Get receipt details                   | –                                                | `Receipt` with items    |
| PUT    | `/receipts/:id/accept` | Accept items after quality check   | `{ items: [{ receiptItemId, quantityAccepted }] }` | Updated `Receipt`       |

**Receipt Entity:**
```json
{
  "id": 500,
  "receiptNumber": "REC-2025-001",
  "warehouseId": 1,
  "purchaseOrderId": 80,
  "iImportPermit": "IMP-2025-001",
  "status": "ACCEPTED",
  "items": [
    {
      "id": 1001,
      "productId": 10,
      "batchNumber": "BN-2024-001",
      "quantityReceived": 2000,
      "quantityAccepted": 1950,
      "unitCost": 0.85,
      "currency": "USD",
      "labTestRequired": true
    }
  ],
  "receivedDate": "2025-12-01T08:00:00Z"
}
```

- Validation: Received quantity must not exceed import permit allowed quantity.  
- Auto‑generates stock after acceptance and creates `CostLayer` entries.  
- If `labTestRequired`, batches are initially quarantined.

### 2.3 Stock Adjustments, Transfers & Disposals

| Method | Endpoint                        | Description                           | Body / Query                              | Response        | FR    |
|--------|---------------------------------|---------------------------------------|-------------------------------------------|-----------------|-------|
| POST   | `/stock/transfer`               | Transfer stock between bins/warehouses | `{ fromStockId, toWarehouseId, toBinLabel?, quantity, reason }` | `TransferResult` | FR‑036 |
| POST   | `/stock/adjustment`             | Manual inventory adjustment (shrinkage) | `{ stockId, adjustedQuantity, reason }`  | `AdjustmentLog`  | FR‑054 |
| POST   | `/stock/dispose`                | Dispose of expired/damaged stock      | `{ stockId, quantity, disposalMethod }`   | `DisposalLog`    | FR‑065 |

All movements create immutable `StockLedger` entries.

### 2.4 Picking & FEFO (FR‑011, FR‑075, FR‑085)

| Method | Endpoint                   | Description                              | Request Body                               | Response                     |
|--------|----------------------------|------------------------------------------|--------------------------------------------|------------------------------|
| POST   | `/picking/reserve`         | Reserve stock for an order (FEFO)        | `{ warehouseId, productId, quantity, orderReference? }` | `{ reservations: [{ stockId, batchId, reservedQty }] }` |
| POST   | `/picking/confirm`         | Confirm pick and deduct stock            | `{ reservationId, actualQty?, binLabel? }` | `PickConfirmation`          |
| POST   | `/picking/pick-and-ship`   | One‑step pick+ship for a sales order     | `{ salesOrderId, pickedItems: [{ productId, batchId, quantity }] }` | `ShipmentConfirmation`      |

- FEFO logic: system picks the batch with earliest expiry date that has available unreserved quantity.  
- Scanning: client sends scanned barcode (product SKU or batch) to validate.

---

## 3. Batch & Quality Management

| Method | Endpoint                             | Description                                 | Parameters / Body                           | Response                       | FR          |
|--------|--------------------------------------|---------------------------------------------|---------------------------------------------|--------------------------------|-------------|
| GET    | `/batches`                           | List batches with filters                   | `?productId, status, expiringWithinDays, page` | `BatchesList`                | FR‑013, FR‑017 |
| GET    | `/batches/:id`                       | Batch details with traceability             | –                                           | `BatchDetail` (with receipt, tests, stocks) | FR‑001, FR‑005 |
| PUT    | `/batches/:id/quarantine`            | Move batch to quarantine                    | `{ reason }`                                | Updated batch                 | FR‑014 |
| PUT    | `/batches/:id/release`               | Release batch from quarantine               | `{ testIds: [] }` (all tests must pass)     | Updated batch                 | FR‑004 |
| PUT    | `/batches/:id/recall`                | Initiate recall                             | `{ reason }`                                | Updated batch status RECALLED, triggers notifications | FR‑005 |
| POST   | `/batches/:id/lab-tests`             | Add lab test result                         | `{ testType, status, resultValue, remarks }`| `LabTest` object              | FR‑020 |
| GET    | `/batches/:id/eudr-document`         | Get deforestation‑free document (if export)  | –                                           | `EudrDocument`                | FR‑003 |
| POST   | `/batches/:id/eudr-document`         | Attach EUDR certificate                    | `{ certificateUrl, geoCoordinates, deforestationRisk }` | `EudrDocument` | FR‑003 |

**BatchDetail** includes:
- Full forward/backward trace: all `StockLedger` movements, associated `ReceiptItem`, `WorkOrderOutput` (if produced), and `SalesOrderItem` shipments.
- Current stock per warehouse/bin.

---

## 4. Procurement & Supplier Management

### 4.1 Suppliers (FR‑007, FR‑035, FR‑064)

| Method | Endpoint               | Description                          | Body / Params                           | Response        |
|--------|------------------------|--------------------------------------|-----------------------------------------|-----------------|
| GET    | `/suppliers`           | List suppliers                       | `?isActive, search, page`               | `Supplier[]`    |
| POST   | `/suppliers`           | Create a supplier                    | Supplier object                         | `Supplier`      |
| PUT    | `/suppliers/:id`       | Update supplier details              | Partial supplier object                 | `Supplier`      |
| GET    | `/suppliers/:id/ratings`| Get supplier performance            | `?period`                               | `SupplierRating` |
| POST   | `/suppliers/:id/ratings`| Add/update rating                  | `{ onTimeDelivery, qualityScore, overallScore, periodStart, periodEnd }` | `SupplierRating` |

### 4.2 Purchase Orders & Forex (FR‑021, FR‑025, FR‑029)

| Method | Endpoint                         | Description                       | Request Body                    | Response               |
|--------|----------------------------------|-----------------------------------|---------------------------------|------------------------|
| POST   | `/purchase-orders`               | Create a new PO                   | `{ supplierId, currency, lcId?, items: [{ productId, quantity, unitPrice }], expectedDate }` | `PurchaseOrder`        |
| GET    | `/purchase-orders`               | List POs                          | `?status, supplierId, dateFrom, dateTo` | `PurchaseOrder[]`      |
| GET    | `/purchase-orders/:id`           | PO details                        | –                               | `PurchaseOrder` (incl. items) |
| PUT    | `/purchase-orders/:id`           | Update PO (only if DRAFT)         | Partial body                    | Updated PO             |
| POST   | `/purchase-orders/:id/submit`    | Submit for approval               | –                               | Updated PO             |
| POST   | `/purchase-orders/:id/allocate-forex` | Allocate forex to this PO    | `{ allocatedAmount, rate }`     | `ForexAllocation`      |
| GET    | `/forex-rates`                   | List current forex rates          | `?currency`                     | `ForexRate[]`          |
| POST   | `/forex-rates`                   | Add a new forex rate              | `{ currency, rateToETB, source }` | `ForexRate`          |

- Forex allocation planning: The backend suggests prioritised PO list via `GET /purchase-orders/prioritize?budget=1000&currency=USD` (FR‑021).

---

## 5. Sales & Distribution (FR‑039, FR‑040, FR‑086)

| Method | Endpoint                         | Description                                  | Request Body / Query                          | Response                 |
|--------|----------------------------------|----------------------------------------------|-----------------------------------------------|--------------------------|
| POST   | `/sales-orders`                  | Create a new sales order                     | `{ customerId, warehouseId, items: [{ productId, quantity }], requiredDate? }` | `SalesOrder`           |
| GET    | `/sales-orders`                  | List orders with filters                     | `?status, customerId, dateFrom, dateTo`       | `SalesOrder[]`          |
| GET    | `/sales-orders/:id`              | Order details                                | –                                             | `SalesOrder` with items |
| PUT    | `/sales-orders/:id/status`       | Update order status (e.g., PICKING, SHIPPED) | `{ status, trackingNumber? }`                 | Updated order           |
| POST   | `/sales-orders/:id/returns`      | Log a return                                 | `{ items: [{ productId, batchId?, quantity, reason }] }` | `Return`               |
| GET    | `/returns/:id`                   | Return details                               | –                                             | `Return`                |
| POST   | `/returns/:id/disposition`       | Set disposition (RESTOCK / SCRAP)            | `{ items: [{ returnItemId, disposition }] }`  | Updated return          |

- Customer stock visibility portal: a limited access endpoint `/customer-portal/stock` (with separate auth) (FR‑086).

---

## 6. Production & Bill of Materials (FR‑041–FR‑045)

| Method | Endpoint                         | Description                             | Request Body                     | Response          |
|--------|----------------------------------|-----------------------------------------|----------------------------------|-------------------|
| POST   | `/boms`                          | Create a Bill of Materials              | `{ productId, items: [{ componentProductId, quantityPerUnit, scrapFactor }] }` | `BOM` |
| GET    | `/boms?productId=10`             | List BOMs for a product                 | `?activeOnly=true`              | `BOM[]`           |
| PUT    | `/boms/:id`                      | Update BOM (creates new version)        | Updated items                    | `BOM` (new version) |
| POST   | `/work-orders`                   | Create a work order                     | `{ productId, bomId, quantity, startDate? }` | `WorkOrder` |
| GET    | `/work-orders`                   | List work orders                        | `?status, productId`             | `WorkOrder[]`     |
| PUT    | `/work-orders/:id/materials`     | Record material consumption             | `{ materials: [{ productId, batchId?, consumedQty }] }` | Updated WO |
| PUT    | `/work-orders/:id/complete`      | Complete work order (output batch)      | `{ batchNumber, quantity }`      | Updated WO        |
| GET    | `/work-orders/:id/yield`         | Yield analysis                          | –                                | `{ plannedYield, actualYield, variance }` |

---

## 7. Regulatory & Compliance Exports (FR‑002, FR‑004, FR‑088)

| Method | Endpoint                          | Description                        | Parameters               | Response         |
|--------|-----------------------------------|------------------------------------|--------------------------|------------------|
| POST   | `/regulatory/export-eris`         | Generate eRIS data file            | `{ dateRange?, format }` | `{ fileUrl }`    |
| POST   | `/regulatory/export-tax`          | Export tax valuation report        | `{ periodStart, periodEnd }` | `{ fileUrl }` |
| POST   | `/regulatory/export-audit`        | Instant inspection report          | `{ warehouseId?, date }` | JSON report data (can also be downloaded) |
| GET    | `/regulatory/export-history`      | List previous exports              | `?type, date`            | `RegulatoryExport[]` |

---

## 8. IoT & Environmental Monitoring (FR‑012, FR‑016)

| Method | Endpoint                    | Description                       | Body / Query                            | Response          |
|--------|-----------------------------|-----------------------------------|-----------------------------------------|-------------------|
| POST   | `/iot/readings`             | Ingest sensor reading (system)    | `{ sensorId, zoneId, readingType, value, timestamp }` | 201 Created      |
| GET    | `/iot/readings`             | Query temperature/humidity logs   | `?sensorId, zoneId, from, to, lastN`   | `IotReading[]`   |
| GET    | `/iot/alerts`               | List temperature excursion alerts | `?acknowledged, from, to`               | `AlertLog[]`     |
| PUT    | `/iot/alerts/:id/acknowledge`| Acknowledge an alert             | –                                       | Updated alert    |

---

## 9. Reporting & Dashboard (FR‑051–FR‑058)

All reporting endpoints use `GET` and accept date ranges and warehouse filters.

| Endpoint                         | Description                               | Response Example               |
|----------------------------------|-------------------------------------------|--------------------------------|
| `/reports/abc-analysis`          | ABC classification based on consumption value | `{ A: [{ productId, totalValue }], B, C }` |
| `/reports/inventory-turnover`    | Turnover ratio per product/warehouse      | `{ productId, turnover }`     |
| `/reports/slow-movers`           | Items below turnover threshold             | `Stock[]`                     |
| `/reports/stock-valuation`       | Total stock value (FIFO or WA)             | `{ totalValueETB, byWarehouse }` |
| `/reports/expiry-nearing`        | Batches expiring within N days             | `Batches[]`                   |
| `/reports/stock-out-risk`        | Products below safety stock                | `{ productId, currentStock, safetyStock }` |
| `/reports/shrinkage`             | Shrinkage comparison                       | `{ adjustments: [] }`         |
| `/reports/demand-forecast`       | Seasonal demand patterns                  | `{ productId, seasonalIndex[] }` |
| `/dashboards/executive`          | KPIs: total stock value, days of cover, non‑moving stock, compliance alerts | `{ kpis: {} }` |

---

## 10. User & Role Management (FR‑067–FR‑074)

| Method | Endpoint                       | Description                          | Request Body                    | Response        |
|--------|--------------------------------|--------------------------------------|---------------------------------|-----------------|
| GET    | `/users`                       | List users                           | `?role, active, search`        | `User[]`        |
| POST   | `/users`                       | Create a user                        | `{ employeeId, fullName, email, password, roles: [] }` | `User` (without password) |
| PUT    | `/users/:id`                   | Update user details / roles           | Partial user object             | Updated user    |
| GET    | `/users/:id/audit-log`         | Get a user's activity history        | `?page, limit`                 | `AuditLog[]`    |
| GET    | `/roles`                       | List roles                           | –                               | `Role[]`        |
| POST   | `/roles`                       | Create a role                        | `{ name, description, permissions: [] }` | `Role` |
| GET    | `/permissions`                 | List all permissions                  | –                               | `Permission[]`  |
| PUT    | `/users/:id/warehouse-scope`   | Assign warehouse restrictions         | `{ warehouseIds: [] }`         | Updated user    |

---

## 11. Audit & Security (FR‑068, FR‑069, FR‑071)

| Method | Endpoint                         | Description                     | Parameters | Response       |
|--------|----------------------------------|---------------------------------|------------|----------------|
| GET    | `/audit-logs`                    | List audit trail entries        | `?entity, entityId, userId, from, to, page` | `AuditLog[]`   |
| GET    | `/audit-logs/:id`                | Single audit log detail         | –          | `AuditLog`     |

The `AuditLog` is automatically created by the system for every write operation.

---

## 12. Notifications & Alerts (FR‑013, FR‑061, FR‑069)

| Method | Endpoint                  | Description                             | Query / Body                 | Response       |
|--------|---------------------------|-----------------------------------------|------------------------------|----------------|
| GET    | `/alerts`                 | List active alerts                      | `?acknowledged, type`       | `AlertLog[]`   |
| PUT    | `/alerts/:id/acknowledge` | Acknowledge an alert                    | –                            | Updated alert  |
| GET    | `/alert-thresholds`       | Get product alert thresholds            | `?productId`                 | `AlertThreshold[]` |
| POST   | `/alert-thresholds`       | Set a new threshold                     | `{ productId, alertType, daysBeforeExpiry?, minStockLevel?, notifyRoles }` | `AlertThreshold` |
| PUT    | `/alert-thresholds/:id`   | Update threshold                        | Partial body                 | Updated threshold |
| DELETE | `/alert-thresholds/:id`   | Remove threshold                        | –                            | –               |

---

## 13. Blockchain & Event Stream (FR‑083)

| Method | Endpoint                | Description                     | Parameters       | Response           |
|--------|-------------------------|---------------------------------|------------------|--------------------|
| GET    | `/batch-events`         | List all batch events           | `?batchId, type, from, to` | `BatchEvent[]` |
| GET    | `/batch-events/:id`     | Single event detail (with hash) | –                | `BatchEvent`       |

These events are immutable and can be consumed by external blockchain services.

---

## 14. Error Codes Summary

| HTTP Status | Code                  | Meaning                       |
|-------------|-----------------------|-------------------------------|
| 400         | `VALIDATION_ERROR`    | Invalid request parameters    |
| 401         | `UNAUTHORIZED`        | Missing or invalid token      |
| 403         | `FORBIDDEN`           | Insufficient permissions      |
| 404         | `NOT_FOUND`           | Resource not found            |
| 409         | `CONFLICT`            | Stock reservation conflict, duplicate batch, etc. |
| 422         | `BUSINESS_RULE_ERROR` | Quarantine release without tests, import permit exceeded, etc. |
| 500         | `INTERNAL_ERROR`      | Server error                  |

---

This API contract completely maps to the functional requirements, database schema, and technology stack. Each endpoint is implemented in the Express server, leveraging Prisma for data access, and all business rules (FEFO, cost layering, quarantine, etc.) are enforced in the service layer.
