# Advanced Inventory Management System (AIMS) - Backend

A production-ready, full-stack backend for the Advanced Inventory Management System designed for Ethiopia's food, chemical, and pharmaceutical industries.

## Features

- **Complete RBAC** - Role-based access control with fine-grained permissions
- **Multi-warehouse support** - Manage inventory across multiple locations
- **FEFO compliance** - First-Expired-First-Out picking for perishable goods
- **Batch traceability** - Full forward/backward traceability from receipt to dispatch
- **Regulatory compliance** - eRIS integration, EUDR documentation, EFDA reporting
- **IoT integration** - Cold chain monitoring with MQTT sensor ingestion
- **FIFO/Weighted Average costing** - Accurate COGS computation
- **Forex management** - LC tracking and allocation planning

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL 8.0
- **Authentication**: JWT with refresh token rotation
- **Validation**: Joi/Zod
- **Testing**: Jest + Supertest

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file and configure:
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. (Optional) Seed the database with initial data:
```bash
npm run prisma:seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Project Structure

```
backend/
├── prisma/                       # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication module
│   │   ├── inventory/            # Stock management
│   │   ├── procurement/          # Purchase orders & suppliers
│   │   ├── quality/              # Batch & quality management
│   │   ├── production/           # BOM & work orders
│   │   ├── sales/                # Sales orders & distribution
│   │   ├── compliance/           # Regulatory exports
│   │   ├── iot/                  # IoT sensor integration
│   │   ├── users/                # User management
│   │   ├── reporting/            # Dashboards & analytics
│   │   └── alerts/               # Alert system
│   ├── middleware/               # Express middlewares
│   ├── utils/                    # Shared utilities
│   ├── services/                 # Cross-cutting services
│   ├── jobs/                     # Background jobs
│   ├── config/                   # Configuration files
│   ├── app.js                    # Express app setup
│   └── server.js                 # Entry point
├── tests/                        # Test files
├── .env.example
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/change-password` - Change password

### Inventory (to be implemented)
- `GET /api/v1/stock` - List stock across warehouses
- `POST /api/v1/receipts` - Create goods receipt
- `POST /api/v1/stock/transfer` - Transfer stock
- `POST /api/v1/picking/reserve` - Reserve stock (FEFO)

### Quality (to be implemented)
- `GET /api/v1/batches` - List batches
- `PUT /api/v1/batches/:id/release` - Release from quarantine
- `PUT /api/v1/batches/:id/recall` - Initiate recall

See [API Contract Design](../docs/API_Contract_Design.md) for complete endpoint documentation.

## Development

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:integration  # Integration tests
```

### Linting & Formatting
```bash
npm run lint          # Check code style
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format code with Prettier
```

### Database Commands
```bash
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:migrate    # Create and apply migrations
npm run prisma:generate   # Regenerate Prisma Client
```

## Docker Support

Build and run with Docker Compose:
```bash
docker-compose up -d
```

## License

MIT
