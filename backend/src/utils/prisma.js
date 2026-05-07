const { PrismaClient } = require('@prisma/client');

/**
 * Singleton Prisma Client instance
 * Prevents multiple instances in development due to hot-reloading
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
