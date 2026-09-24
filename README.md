# AIMS — Advanced Inventory Management System (Chemical Factory)

A full-stack inventory management system built for Ethiopia's food, chemical, and pharmaceutical industries. It covers the complete warehouse lifecycle — from procurement and goods receipt through storage, quality control, production, and sales dispatch — with regulatory compliance, batch traceability, and IoT cold-chain monitoring.

## Project Structure

```
.
├── backend/     # Node.js + Express REST API (Prisma ORM, MySQL 8)
├── frontend/    # React 18 SPA (Vite, Redux Toolkit, Tailwind CSS)
└── docs/        # Functional requirements, technical spec, DB & API design
```

## Features

- **Role-Based Access Control (RBAC)** — fine-grained permissions, user/role management, permission matrix UI
- **Multi-warehouse inventory** — stock lists, bin locations, transfers, adjustments, barcode scanning
- **FEFO picking** — First-Expired-First-Out for perishable/chemical goods
- **Batch traceability & quality** — lab tests, certificates of analysis, forward/backward traceability chains, recall management, EUDR documentation
- **Procurement & sales** — purchase orders, goods receipts, sales orders, pick lists, shipments, returns, customer portal
- **Production** — production order management linked to inventory consumption
- **Regulatory compliance** — Ethiopian eRIS (EFDA) export, tax reporting exports, audit trail/timeline
- **IoT integration** — MQTT sensor ingestion, temperature graphs, cold-chain excursion alerts
- **Reporting & analytics** — ABC analysis, expiry risk, stock-out risk, slow movers, demand forecasting, inventory turnover, dashboard widgets
- **Alerts & notifications** — expiry alerts, stock-out risk, notification bell, scheduled jobs (ABC analysis, lead-time updates)
- **Offline capability** — service worker, IndexedDB queue, offline sync utilities for handheld scanners
- **Costing** — FIFO / weighted-average COGS computation; forex/LC tracking helpers

## Tech Stack

### Backend (`/backend`)
| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 18, Express.js |
| Database | MySQL 8.0 via Prisma ORM |
| Auth | JWT with refresh-token rotation, bcryptjs |
| Validation | Joi |
| Security | Helmet, CORS allow-list, RBAC middleware |
| IoT | MQTT client |
| Testing | Jest + Supertest (unit, integration, e2e) |

### Frontend (`/frontend`)
| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| State | Redux Toolkit (auth, UI, offline-queue slices) |
| Routing | React Router v6 with protected routes & role guards |
| Styling | Tailwind CSS |
| Charts | Chart.js / Recharts |
| HTTP | Axios (JWT interceptors) + Socket.IO client |
| Barcode | QuaggaJS + scanner hook |
| Offline | Service worker + IndexedDB (`idb`) |

## API Overview

All endpoints are mounted under `/api/v1` (see `backend/src/app.js`):

| Prefix | Module |
|--------|--------|
| `/auth` | Authentication, login/logout, token refresh |
| `/users` | User & role administration |
| `/inventory` | Stock, receipts, transfers, adjustments |
| `/batches` | Batch/quality management (lab tests, recalls, CoAs) |
| `/purchase-orders` | Procurement |
| `/sales-orders` | Sales, shipments, returns |
| `/production` | Production orders |
| `/reporting` | Reports & analytics |
| `/alerts` | Alerts & notifications |
| `/compliance` | eRIS/EUDR/tax exports, audit reports |
| `/iot` | Sensors, temperature readings, excursions |

A `/health` endpoint is also exposed for liveness checks.

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env        # configure DB credentials, JWT secrets, etc.
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed         # optional seed data
npm run dev                 # nodemon dev server
```

See `backend/README.md` and `backend/docker-compose.yml` for Docker-based setup.

### Frontend

```bash
cd frontend
npm install
npm run dev                 # Vite dev server
npm run build               # production build
```

### Tests

```bash
cd backend
npm test                    # unit/integration tests with coverage
npm run test:integration
```

## Documentation

Detailed design documents live in [`/docs`](docs/):

- [Functional Requirements](docs/functional_requirements.md) (FR‑001 … FR‑090)
- [Technical Specification](docs/Technical_Specification_Document.md)
- [Database Design](docs/Database_Design.md)
- [API Contract Design](docs/API_Contract_Design.md)
- [Frontend Architecture & UI Design](docs/Frontend_Architecture_&_UI_Design.md)
- [Frontend Folder & File Organization](docs/Frontend_Folder_&_File_Organization.md)
- [Backend File & Folder Organization](docs/backend_file_and_fogers_organization.md)

## Requirements

- Node.js ≥ 18
- MySQL 8.0+
- An MQTT broker (only required for IoT cold-chain features)

## License

MIT (see `backend/package.json`).
