const cron = require('node-cron');
const expiryAlertJob = require('./expiryAlertJob');
const stockOutRiskJob = require('./stockOutRiskJob');
const abcAnalysisJob = require('./abcAnalysisJob');
const leadTimeUpdateJob = require('./leadTimeUpdateJob');

/**
 * Job Scheduler
 * Initialises and manages all scheduled background jobs (FR-013, FR-052, FR-061)
 */
class Scheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialise all scheduled jobs
   */
  init() {
    console.log('Initialising scheduled jobs...');

    // Daily at 08:00 - Check expiring batches (FR-013)
    const expiryJob = cron.schedule('0 8 * * *', async () => {
      console.log('Running expiry alert job...');
      await expiryAlertJob.run();
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa',
    });
    this.jobs.push({ name: 'expiryAlertJob', job: expiryJob });

    // Every 6 hours - Check stock-out risk (FR-061)
    const stockOutJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Running stock-out risk job...');
      await stockOutRiskJob.run();
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa',
    });
    this.jobs.push({ name: 'stockOutRiskJob', job: stockOutJob });

    // Weekly on Monday at 02:00 - ABC analysis (FR-052)
    const abcJob = cron.schedule('0 2 * * 1', async () => {
      console.log('Running ABC analysis job...');
      await abcAnalysisJob.run();
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa',
    });
    this.jobs.push({ name: 'abcAnalysisJob', job: abcJob });

    // Monthly on 1st at 03:00 - Update lead times (FR-031)
    const leadTimeJob = cron.schedule('0 3 1 * *', async () => {
      console.log('Running lead time update job...');
      await leadTimeUpdateJob.run();
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa',
    });
    this.jobs.push({ name: 'leadTimeUpdateJob', job: leadTimeJob });

    console.log(`Scheduled ${this.jobs.length} jobs`);
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('Stopping all scheduled jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
  }

  /**
   * Get job status
   * @returns {Array} - Array of job statuses
   */
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: !job.stopped,
    }));
  }
}

module.exports = new Scheduler();
