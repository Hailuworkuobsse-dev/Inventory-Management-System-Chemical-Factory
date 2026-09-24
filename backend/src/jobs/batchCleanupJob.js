const prisma = require('../utils/prisma');

/**
 * Mark expired batches as EXPIRED
 * This job runs daily at 04:00
 */
const runBatchCleanupJob = async () => {
  try {
    const now = new Date();

    const result = await prisma.batch.updateMany({
      where: {
        expiryDate: { lt: now },
        status: { not: 'EXPIRED' }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    console.log(`Marked ${result.count} batches as EXPIRED`);
    
    return {
      success: true,
      message: 'Batch cleanup completed',
      count: result.count
    };

  } catch (error) {
    console.error('Batch cleanup job failed:', error);
    throw error;
  }
};

module.exports = {
  runBatchCleanupJob
};
