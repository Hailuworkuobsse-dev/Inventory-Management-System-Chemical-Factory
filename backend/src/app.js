const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config = require('./config');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const usersRoutes = require('./modules/users/users.routes');
const procurementRoutes = require('./modules/procurement/procurement.routes');
const qualityRoutes = require('./modules/quality/quality.routes');
const productionRoutes = require('./modules/production/production.routes');
const salesRoutes = require('./modules/sales/sales.routes');
const complianceRoutes = require('./modules/compliance/compliance.routes');
const iotRoutes = require('./modules/iot/iot.routes');
const reportingRoutes = require('./modules/reporting/reporting.routes');
const alertsRoutes = require('./modules/alerts/alerts.routes');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    data: null,
    message: 'Too many requests, please try again later',
    errors: [{ code: 'RATE_LIMIT_EXCEEDED', description: 'Too many requests' }]
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'OK', timestamp: new Date().toISOString() },
    message: 'API is running',
    errors: null
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stock', inventoryRoutes);
app.use('/api/v1/receipts', inventoryRoutes);
app.use('/api/v1/picking', inventoryRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/purchase-orders', procurementRoutes);
app.use('/api/v1/suppliers', procurementRoutes);
app.use('/api/v1/batches', qualityRoutes);
app.use('/api/v1/work-orders', productionRoutes);
app.use('/api/v1/boms', productionRoutes);
app.use('/api/v1/sales-orders', salesRoutes);
app.use('/api/v1/returns', salesRoutes);
app.use('/api/v1/regulatory', complianceRoutes);
app.use('/api/v1/iot', iotRoutes);
app.use('/api/v1/reports', reportingRoutes);
app.use('/api/v1/alerts', alertsRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
