# AIMS Backend - Advanced Inventory Management System

## Overview

Production-ready backend API for the Advanced Inventory Management System (AIMS), designed for Ethiopian manufacturing companies in pharmaceutical, food, and chemical industries.

## Features

- **Complete RBAC** - Role-based access control with fine-grained permissions
- **FEFO Enforcement** - First-Expired-First-Out picking logic
- **Batch Traceability** - Full forward/backward traceability from receipt to dispatch
- **Multi-Warehouse** - Support for multiple warehouses with zone/bin management
- **Cost Layering** - FIFO and Weighted Average cost methods
- **Quality Management** - Quarantine, lab tests, certificate management
- **Regulatory Compliance** - eRIS integration, EUDR documentation, audit trails
- **IoT Integration** - Temperature/humidity monitoring with alerts
- **Forex Management** - LC tracking and forex allocation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL 8.0
- **Validation**: Joi/Zod
- **Authentication**: JWT
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- Redis (optional, for BullMQ)

### Installation

```bash
# Clone repository
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Default Configuration

- **Port**: 3000
- **API Base URL**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/health`

## Project Structure

```
backend/
├── prisma/                    # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication & authorization
│   │   ├── inventory/         # Stock management, receipts, transfers
│   │   ├── procurement/       # Purchase orders, suppliers
│   │   ├── quality/           # Batch management, lab tests
│   │   ├── production/        # BOM, work orders
│   │   ├── sales/             # Sales orders, returns
│   │   ├── compliance/        # Regulatory exports
│   │   ├── iot/               # IoT sensor integration
│   │   ├── reporting/         # Dashboards & reports
│   │   ├── alerts/            # Alert management
│   │   └── users/             # User & role management
│   ├── middleware/            # Express middlewares
│   ├── utils/                 # Shared utilities
│   ├── config/                # Configuration files
│   ├── services/              # Cross-cutting services
│   ├── jobs/                  # Scheduled tasks
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
├── tests/                     # Test files
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/change-password` - Change password

### Inventory
- `GET /api/v1/stock` - List stock across warehouses
- `GET /api/v1/stock/:id` - Get stock details
- `POST /api/v1/receipts` - Create goods receipt
- `PUT /api/v1/receipts/:id/accept` - Accept receipt after QC
- `POST /api/v1/stock/transfer` - Transfer stock
- `POST /api/v1/picking/reserve` - Reserve stock (FEFO)

### Quality
- `GET /api/v1/batches` - List batches
- `PUT /api/v1/batches/:id/release` - Release from quarantine
- `PUT /api/v1/batches/:id/recall` - Initiate recall

[See API_Contract_Design.md for complete endpoint documentation]

## Development

```bash
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Open Prisma Studio
npm run prisma:studio
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
