require('dotenv').config();

const app = require('./app');
const prisma = require('./utils/prisma');
const config = require('./config');

async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✓ Database connected successfully');

    // Start server
    app.listen(config.PORT, () => {
      console.log(`✓ AIMS API running on port ${config.PORT}`);
      console.log(`✓ Environment: ${config.NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${config.PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n✓ SIGTERM received. Shutting down gracefully...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\n✓ SIGINT received. Shutting down gracefully...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

main();
