# Technical Specification Document
## Advanced Inventory Management System (AIMS)
### For Ethiopia's Food, Chemical, and Pharmaceutical Sectors

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-06 | System Architect | Initial technical specification |

---

## 1. Introduction

### 1.1 Purpose
This document defines the technical blueprint for building, deploying, and maintaining the Advanced Inventory Management System (AIMS). It covers the technology stack, system architecture, key components, data model, API design, security measures, and deployment strategy. The design is derived from 90 functional requirements (FR‑001 to FR‑090) that address regulatory, quality, financial, supply chain, and operational needs in Ethiopia's food, chemical, and pharmaceutical industries.

### 1.2 Scope
The specification covers:

- A web‑based, single‑page application (SPA) for warehouse operators, managers, and executives.
- A RESTful API layer for business logic and data access.
- Integration with external systems: Ethiopian Food and Drug Authority (EFDA) eRIS, IoT sensors, third‑party logistics (3PL), existing ERP, and future blockchain platforms.
- Offline-capable mobile interface for handheld scanners used in audits and picking.
- Support for scaling from 1,000 to over 1,000,000 SKUs without architectural change.

### 1.3 References
- AIMS Functional Requirements (FR‑001 to FR‑090)
- EFDA Electronic Regulatory Information System (eRIS) interface guidelines
- EU Deforestation Regulation (EUDR) documentation standards
- Ethiopian Ministry of Revenue tax reporting requirements

---

## 2. Technology Stack & Rationale

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React 19, Vite 6 | Component‑based UI, fast HMR, optimal production builds. |
| State Management | Redux Toolkit (RTK) + RTK Query | Predictable global state, built‑in API caching, and auto‑generated hooks for Axios endpoints. |
| HTTP Client | Axios | Interceptors for JWT refresh, request cancellation, and CORS handling. |
| Backend | Node.js (Express) | JavaScript full‑stack, large ecosystem, non‑blocking I/O suitable for high‑concurrency inventory operations. |
| API Framework | Express.js | Lightweight, middleware‑rich, compatible with Prisma and CORS. |
| ORM | Prisma | Type‑safe database access, auto‑migration, schema‑first design, excellent MySQL support. |
| Database | MySQL 8.0 (InnoDB) | ACID compliance, strong indexing, row‑level locking; widely supported in Ethiopian enterprise environments. |
| Authentication | JWT (Access + Refresh tokens) | Stateless authentication, fine‑grained role claims, secure against CSRF with httpOnly cookies. |
| Real‑time | WebSocket (Socket.io) for critical alerts; Server‑Sent Events (SSE) for dashboards | Pushes expiry alerts, stock‑out warnings, and cold‑chain excursions instantly. |
| CORS | cors middleware (Express) | Enforces allowed origins, methods, and headers for the React SPA and partner portals. |
| IoT Integration | MQTT broker (e.g., Mosquitto) + Node.js MQTT client | Ingests temperature/humidity sensor data; triggers quarantine events. |
| Offline Support | Service Worker (Workbox) + IndexedDB (local inventory cache) | Enables barcode scanning and basic transactions even during connectivity loss; syncs when online. |
| Mobile Frontend | React Native (optional) or PWA (bundled via Vite) | PWA approach preferred: installable, camera access for barcodes, offline capability. |
| Hosting | Containerised (Docker) on AWS/GCP or on‑premises VMware | Scalability; hybrid cloud readiness to meet Ethiopian data sovereignty requirements. |
| CI/CD | GitHub Actions / GitLab CI | Automated testing, Prisma migration checks, and Docker image builds. |
| Monitoring | Grafana + Prometheus + Winston logger | Structured logging, metrics dashboards, alerting. |

---

## 3. System Architecture

The system follows a three‑tier, service‑oriented architecture with optional offline‑first capabilities.

![AIMS Architecture Diagram](https://via.placeholder.com/800x400?text=AIMS+Architecture+Diagram)

### 3.1 High‑Level Components

**Client Tier:** React SPA (PWA) accessible via browser or installed as a mobile app. Communicates with API via Axios over HTTPS.

**API Gateway / Backend Tier:** Express.js server exposing RESTful endpoints. Uses Prisma for all database operations. Integrates with external services (eRIS, IoT MQTT, ERP).

**Data Tier:** MySQL 8.0 database storing all master data, transactions, audit logs, and user information.

**Supporting Services:**
- **MQTT Bridge** – Microservice that subscribes to sensor topics and calls the API to record cold‑chain readings.
- **Notification Service** – Dispatches email/SMS alerts (e.g., expiry, stock‑out) using a job queue (BullMQ).
- **Scheduler** – Cron‑based tasks for automatic reorder computation, lead‑time recalculations, and ABC analysis.

### 3.2 Data Flow

1. User interacts with React UI → Axios sends request → API Gateway validates JWT and permissions.
2. Express controller processes the request, invoking Prisma methods.
3. Prisma translates queries into optimised SQL, executes them on MySQL, and returns typed results.
4. For real‑time needs, the backend emits events via Socket.io to the dashboard or alerting clients.
5. Sensor data flows from IoT devices → MQTT broker → MQTT Bridge → API → database; the API then pushes temperature excursions to the UI via WebSocket.

---

## 4. Detailed Component Design

### 4.1 Frontend – React + Vite + Axios

**Structure (Feature‑based):**

```
src/
├── features/
│   ├── inventory/
│   ├── procurement/
│   ├── quality/
│   ├── production/
│   ├── compliance/
│   └── dashboard/
├── components/        (shared)
├── services/          (Axios instances & interceptors)
├── store/             (RTK slices)
└── utils/
```

**Key technology choices:**

- Vite configures proxy for API during development to avoid CORS issues.
- Axios instance with base URL, automatic Authorization header injection from Redux store, and interceptors for 401 → refresh token flow.
- RTK Query creates auto‑generated hooks for all API endpoints defined in a central `apiSlice.js`. This reduces boilerplate and provides cache invalidation after mutations.
- **PWA Support:** `vite-plugin-pwa` generates a service worker using Workbox, caching the HTML shell and key API responses for limited offline operation. Scanner functionality uses the `MediaDevices.getUserMedia()` API for barcode reading.
- **Off‑line transaction queue:** When offline, barcode scans and stock movements are stored in IndexedDB (local); upon connectivity, a background sync process replays them via the API.

### 4.2 Backend – Express + Prisma + MySQL

**Middleware Stack:**
- `cors()` – Configured with allowed origin (the Vite dev/prod URL) and credentials support.
- `express.json()` – Body parsing.
- `helmet()` – Security headers.
- `morgan()` – HTTP request logging.
- `authMiddleware` – JWT verification, role extraction, and route protection.
- Rate limiting per user/IP to prevent abuse.

**Project Structure:**

```
server/
├── prisma/
│   ├── schema.prisma    (data model)
│   └── migrations/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── app.js
└── package.json
```

**Prisma Schema (Core Entities)** – see Section 5.

**API Design Convention:**
- Base URL: `/api/v1/`
- RESTful endpoints following resource hierarchy (e.g., `/api/v1/warehouses/:id/stock`).
- Standardised response envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 50, "total": 200 }
}
```

- All write operations are wrapped in Prisma transactions where data consistency across multiple tables is required (e.g., goods receipt updates stock, logs audit, and creates quality sample).

**CORS Configuration (Express cors middleware):**
- Allowed origins: React SPA origin (production domain), partner portals if any.
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Allowed headers: Content-Type, Authorization, X-Requested-With.
- Credentials: true (to support httpOnly refresh token cookies if used).

### 4.3 Authentication & Authorisation

- **Access Token:** JWT (short‑lived, 15 minutes) stored in memory (React state); attached to every Axios request.
- **Refresh Token:** stored in an httpOnly, secure, same‑site cookie; used silently via Axios interceptor to obtain a new access token.
- **Role‑Based Access Control (RBAC):** Roles (admin, manager, operator, quality, read‑only) embedded in JWT claims. Prisma middleware or service‑level checks enforce ownership and permissions (e.g., only quality can release quarantine).
- **API‑level enforcement:** A policy function decorator applied to Express routes.

---

## 5. Data Model (Prisma Schema Abstraction)

Below is a condensed representation of the core Prisma models aligned with the 90 functional requirements.

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Warehouse {
  id        Int      @id @default(autoincrement())
  name      String
  location  String
  zones     Zone[]
  stocks    Stock[]
}

model Zone {
  id          Int         @id @default(autoincrement())
  warehouseId Int
  warehouse   Warehouse   @relation(fields: [warehouseId], references: [id])
  type        ZoneType    // e.g., AMBIENT, COLD, HAZARDOUS, QUARANTINE
  bins        Bin[]
}

model Bin {
  id     Int    @id @default(autoincrement())
  zoneId Int
  zone   Zone   @relation(fields: [zoneId], references: [id])
  label  String
  stocks Stock[]
}

model Product {
  id          Int      @id @default(autoincrement())
  sku         String   @unique
  inn         String?  // International Non-proprietary Name for pharma
  category    Category // API, FOOD, CHEMICAL, PACKAGING
  requiresColdChain Boolean @default(false)
  hazardous   Boolean  @default(false)
  controlled  Boolean  @default(false) // narcotics/psychotropic
  batches     Batch[]
  ...
}

model Batch {
  id            Int      @id @default(autoincrement())
  productId     Int
  product       Product  @relation(fields: [productId], references: [id])
  batchNumber   String
  manufactureDate DateTime
  expiryDate    DateTime
  status        BatchStatus // AVAILABLE, QUARANTINED, RELEASED, RECALLED
  certificates  Certificate[]
  stockEntries  Stock[]
}

model Stock {
  id        Int      @id @default(autoincrement())
  batchId   Int
  batch     Batch    @relation(fields: [batchId], references: [id])
  binId     Int?
  bin       Bin?     @relation(fields: [binId], references: [id])
  quantity  Decimal  @db.Decimal(15,4)
  costPrice Decimal  @db.Decimal(15,4) // bought-at price for forex efficiency
  ...
}

// Supporting models: Supplier, PurchaseOrder, Certificate, AuditLog, User, Role...
// AuditLog designed as an append‑only model
model AuditLog {
  id          Int      @id @default(autoincrement())
  userId      Int
  action      String
  entity      String
  entityId    Int
  oldValue    Json?
  newValue    Json?
  timestamp   DateTime @default(now())
}
```

**Key database features:**
- InnoDB storage engine for transactions and row‑level locking.
- Composite indexes on `(productId, expiryDate)` for FEFO queries, `(batchId, binId)` for picking.
- Full‑text indexes on product names for quick search.
- Partitioning by `expiryDate` if needed for scalability beyond 1M SKUs.

---

## 6. API Endpoints (Representative Selection)

All endpoints are prefixed with `/api/v1`. We illustrate a subset covering major functional areas.

### Inventory & Stock
- `GET /stock?warehouse=1&product=abc` – List stock with FEFO‑optimal order.
- `POST /stock/receipt` – Record goods receipt; validates import permit alignment, updates stock, logs audit.
- `POST /stock/transfer` – Inter‑branch transfer.
- `POST /stock/pick` – Pick items (enforces FEFO and zone rules).

### Quality & Expiry
- `GET /batches/expiring?days=90` – Batches nearing expiry.
- `PUT /batches/:id/quarantine` – Move to quarantine (requires quality role).
- `PUT /batches/:id/release` – Release from quarantine with COC validation.
- `GET /iot/readings?batchId=123` – Cold‑chain temperature log.

### Traceability & Compliance
- `GET /traceability/batch/:number` – Full forward/backward trace.
- `GET /audit/export` – Generate EFDA inspection report.
- `POST /recall/initiate` – Initiate recall, auto‑locks batch, provides affected locations.
- `GET /eRIS/export` – Export data in eRIS‑compatible format.

### Forex & Finance
- `GET /valuation/replacement` – Replacement cost vs. bought‑at price.
- `GET /reports/slow-movers` – Items below turnover threshold.

### Supplier & Procurement
- `POST /purchase-orders` – Create PO with L/C alignment check.
- `GET /suppliers/scorecard` – Performance metrics.

### Security & Admin
- `POST /auth/login` – Returns access token, sets refresh cookie.
- `POST /auth/refresh` – Uses refresh cookie to issue new access token.
- `GET /users/audit-log?userId=5` – Per‑user activity log.

---

## 7. Non‑Functional Requirements

### 7.1 Performance & Scalability
- API response time < 200ms for 95th percentile under 50 concurrent users.
- Horizontal scaling of Express instances behind a load balancer.
- Prisma connection pooling (max 20 connections per instance).
- MySQL read replicas for reporting and dashboard queries.
- Database archiving strategy for audit logs older than 3 years.

### 7.2 Reliability & Availability
- Target 99.5% uptime.
- Use of database transactions to ensure consistency (e.g., stock deduction and financial posting).
- Graceful degradation: if IoT MQTT is down, temperature readings are queued locally and replayed.

### 7.3 Security
- All communication over TLS 1.3.
- Input validation (`express-validator`) on all endpoints.
- CORS and CSP headers enforced.
- Encrypted secrets (JWT secret, DB password) using environment variables/Hashicorp Vault.
- Regular dependency scans (`npm audit`).

### 7.4 Offline & Mobile
- PWA with IndexedDB storage of last 500 scanned items.
- Queue of pending transactions (max 100) stored locally; background sync with conflict resolution (last‑write‑wins for simple counts, manual merge flagged for discrepancies).
- Barcode scanning using the device camera, with debounce to avoid duplicate reads.

### 7.5 Deployment & DevOps
- Containerised using Docker: separate containers for API server, MySQL, MQTT broker (if self‑hosted), and optional Redis for BullMQ.
- Orchestration with Docker Compose for on‑premise or Kubernetes for cloud.
- Database migration via `prisma migrate deploy` as part of CI pipeline.
- Environment‑specific `.env` files (development, staging, production).

---

## 8. Integration Points

| System | Interface | Protocol/Format |
|--------|-----------|-----------------|
| EFDA eRIS | Export file / API (future) | CSV/XML over SFTP |
| ERP (Financial) | Bidirectional sync of COGS, stock val | REST/JSON (Axios) |
| IoT Sensors | MQTT Broker | MQTT (JSON payload) |
| 3PL Providers | Shipment status, POD | REST webhooks |
| Blockchain | Event stream of batch movements | Kafka/AMQP (future) |
| Email/SMS | SendGrid / local SMS gateway | HTTP API |

Axios on the backend is used to call external REST services (e.g., ERP, SMS). A custom integration service layer implements retries, circuit breakers, and logging.

---

## 9. Testing Strategy

- **Unit tests:** Jest for service functions and Prisma‑mocked repositories.
- **API tests:** Supertest + Jest, validating all endpoints with full schema checks.
- **Frontend tests:** React Testing Library + Vitest for component logic; Cypress for critical user journeys (receipt to dispatch).
- **Performance tests:** k6 to simulate concurrent users on stock picking and dashboard API.

---

## 10. Appendix: Database Environment Variables Example

```env
DATABASE_URL="mysql://root:password@localhost:3306/aims?charset=utf8mb4"
JWT_SECRET="your-256-bit-secret"
JWT_REFRESH_SECRET="your-other-256-bit-secret"
CORS_ORIGIN="http://localhost:5173"
MQTT_BROKER_URL="mqtt://localhost:1883"
```

---

## 11. Document Control

Next revision will include detailed sequence diagrams and deployment topology after acceptance of this technical baseline.

---

*End of Technical Specification*
