const express = require('express');
const cors = require('./config/corsOptions');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./modules/auth/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh tokens)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
    message: 'API is running',
    errors: null,
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Mount other module routes here (to be implemented)
// app.use('/api/v1/stock', require('./modules/inventory/inventory.routes'));
// app.use('/api/v1/batches', require('./modules/quality/quality.routes'));
// app.use('/api/v1/purchase-orders', require('./modules/procurement/procurement.routes'));
// app.use('/api/v1/sales-orders', require('./modules/sales/sales.routes'));
// app.use('/api/v1/production', require('./modules/production/production.routes'));
// app.use('/api/v1/users', require('./modules/users/users.routes'));
// app.use('/api/v1/reporting', require('./modules/reporting/reporting.routes'));
// app.use('/api/v1/alerts', require('./modules/alerts/alerts.routes'));
// app.use('/api/v1/compliance', require('./modules/compliance/compliance.routes'));
// app.use('/api/v1/iot', require('./modules/iot/iot.routes'));

// Handle 404 for undefined routes
app.use((req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
