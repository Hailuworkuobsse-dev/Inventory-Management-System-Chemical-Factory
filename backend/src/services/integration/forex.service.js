/**
 * Forex Service
 * Handles currency exchange rate operations
 */

const { AppError } = require('../../utils/customErrors');

class ForexService {
  constructor(config = {}) {
    this.config = config;
    this.provider = config.provider || 'mock'; // mock, openexchangerates, fixer, etc.
    this.apiKey = config.apiKey;
    this.baseCurrency = config.baseCurrency || 'USD';
    this.cache = new Map();
    this.cacheExpiry = config.cacheExpiry || 3600000; // 1 hour default
  }

  /**
   * Get exchange rate between two currencies
   */
  async getRate(baseCurrency, targetCurrency) {
    if (baseCurrency === targetCurrency) {
      return { rate: 1, base: baseCurrency, target: targetCurrency, timestamp: new Date() };
    }

    const cacheKey = `${baseCurrency}_${targetCurrency}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      let rate;

      if (this.provider === 'mock') {
        rate = this._getMockRate(baseCurrency, targetCurrency);
      } else {
        // In production, call external API
        // rate = await this._fetchFromProvider(baseCurrency, targetCurrency);
        rate = this._getMockRate(baseCurrency, targetCurrency);
      }

      const result = {
        rate,
        base: baseCurrency,
        target: targetCurrency,
        timestamp: new Date()
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new AppError(`Failed to get exchange rate: ${error.message}`, 500);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(amount, fromCurrency, toCurrency) {
    const { rate } = await this.getRate(fromCurrency, toCurrency);
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount * rate,
      targetCurrency: toCurrency,
      rate,
      timestamp: new Date()
    };
  }

  /**
   * Record a forex transaction with rate locking
   */
  async recordTransaction(transactionData) {
    const { amount, fromCurrency, toCurrency, purpose } = transactionData;
    
    const { rate } = await this.getRate(fromCurrency, toCurrency);
    
    return {
      ...transactionData,
      appliedRate: rate,
      convertedAmount: amount * rate,
      recordedAt: new Date(),
      rateLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  /**
   * Get historical rates (mock implementation)
   */
  async getHistoricalRates(baseCurrency, targetCurrency, startDate, endDate) {
    // In production, fetch from provider's historical endpoint
    const rates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      rates.push({
        date: new Date(current),
        rate: this._getMockRate(baseCurrency, targetCurrency) * (0.95 + Math.random() * 0.1),
        base: baseCurrency,
        target: targetCurrency
      });
      current.setDate(current.getDate() + 1);
    }

    return rates;
  }

  /**
   * Mock rate generator
   */
  _getMockRate(base, target) {
    const mockRates = {
      USD: { EUR: 0.85, GBP: 0.73, KES: 110.5, TZS: 2350, UGX: 3650, ZMW: 18.5 },
      EUR: { USD: 1.18, GBP: 0.86, KES: 130, TZS: 2765, UGX: 4295, ZMW: 21.8 },
      GBP: { USD: 1.37, EUR: 1.16, KES: 151, TZS: 3215, UGX: 4990, ZMW: 25.3 },
      KES: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, TZS: 21.3, UGX: 33 },
      TZS: { USD: 0.00043, EUR: 0.00036, GBP: 0.00031, KES: 0.047, UGX: 1.55 },
      UGX: { USD: 0.00027, EUR: 0.00023, GBP: 0.00020, KES: 0.030, TZS: 0.65 }
    };

    if (base === target) return 1;
    if (mockRates[base] && mockRates[base][target]) {
      return mockRates[base][target];
    }
    
    // Reverse lookup
    if (mockRates[target] && mockRates[target][base]) {
      return 1 / mockRates[target][base];
    }

    return 1.0; // Default fallback
  }

  /**
   * Fetch from external provider (placeholder)
   */
  async _fetchFromProvider(base, target) {
    // Implementation for OpenExchangeRates, Fixer.io, etc.
    // const response = await axios.get(`https://api.exchangeratesapi.io/latest?base=${base}&symbols=${target}`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}` }
    // });
    // return response.data.rates[target];
    throw new Error('External provider not configured');
  }
}

module.exports = new ForexService();
