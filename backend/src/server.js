require('dotenv').config();
const app = require('./app');
const prisma = require('./utils/prisma');
const config = require('./config');

/**
 * Server Entry Point
 * - Connects to the database
 * - Starts the HTTP server
 * - Initialises background jobs and integrations (if enabled)
 */

async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✓ Connected to database');

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

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
