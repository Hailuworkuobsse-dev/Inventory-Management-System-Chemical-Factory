require('dotenv').config();
const app = require('./app');
const prisma = require('./utils/prisma');
const config = require('./config');

/**
 * Server Entry Point
 * - Validates environment configuration
 * - Connects to the database with retry logic
 * - Starts the HTTP server
 * - Initialises background jobs and integrations (if enabled)
 */

// Validate required environment variables before starting
const envValidation = config.validate();
if (!envValidation.valid) {
  console.error('❌ Environment validation failed:');
  envValidation.errors.forEach(err => console.error(`   - ${err}`));
  console.error('\nPlease ensure all required environment variables are set correctly.');
  process.exit(1);
}

async function connectWithRetry(maxRetries = 3, delayMs = 2000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✓ Connected to database');
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`⚠ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`↻ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

async function main() {
  try {
    // Connect to database with retry logic
    await connectWithRetry();

    // Start HTTP server
    const PORT = config.PORT || 3000;
    
    const server = app.listen(PORT, () => {
      console.log(`✓ AIMS API running on port ${PORT}`);
      console.log(`✓ Environment: ${config.NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      // Close HTTP server
      server.close(async () => {
        console.log('✓ HTTP server closed');
        
        // Disconnect from database
        await prisma.$disconnect();
        console.log('✓ Database connection closed');
        
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('! Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

main();
