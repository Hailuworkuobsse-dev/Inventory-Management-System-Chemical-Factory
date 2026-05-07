/**
 * Currency formatting utilities for Ethiopian Birr (ETB)
 */

const CURRENCY_CODE = 'ETB';
const LOCALE = 'en-ET';

/**
 * Format a number as Ethiopian Birr currency
 * @param {number} amount - Amount to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }
  
  const {
    showSymbol = true,
    decimals = 2,
    locale = LOCALE,
  } = options;
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: CURRENCY_CODE,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
    
    return formatted;
  } catch (error) {
    // Fallback for browsers that don't support ETB
    const symbol = showSymbol ? 'Br ' : '';
    return `${symbol}${amount.toFixed(decimals)}`;
  }
};

/**
 * Format currency with thousand separators (no symbol)
 * @param {number} amount 
 * @returns {string}
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(LOCALE).format(amount);
  } catch (error) {
    return amount.toString();
  }
};

/**
 * Parse currency string back to number
 * @param {string} currencyString 
 * @returns {number}
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and whitespace
  const cleaned = currencyString
    .replace(/[^0-9.-]/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate total from array of items with price property
 * @param {Array} items - Array of items with price/quantity
 * @param {string} priceField - Field name for price (default: 'price')
 * @param {string} qtyField - Field name for quantity (default: 'quantity')
 * @returns {number} Total amount
 */
export const calculateTotal = (items, priceField = 'price', qtyField = 'quantity') => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    const price = Number(item[priceField]) || 0;
    const quantity = Number(item[qtyField]) || 1;
    return total + (price * quantity);
  }, 0);
};

/**
 * Format large amounts with K, M, B suffixes
 * @param {number} amount 
 * @returns {string}
 */
export const formatCompactCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(LOCALE, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    // Manual fallback
    if (amount >= 1e9) {
      return `${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
      return `${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `${(amount / 1e3).toFixed(1)}K`;
    }
    return amount.toString();
  }
};

/**
 * Convert between currencies using exchange rate
 * @param {number} amount - Amount in source currency
 * @param {number} rate - Exchange rate (1 unit of source = rate units of target)
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, rate) => {
  if (amount === null || amount === undefined || isNaN(amount) || !rate) {
    return 0;
  }
  
  return amount * rate;
};

/**
 * Format forex rate display
 * @param {number} rate 
 * @param {string} fromCurrency 
 * @param {string} toCurrency 
 * @returns {string}
 */
export const formatForexRate = (rate, fromCurrency = 'USD', toCurrency = 'ETB') => {
  if (!rate) return '';
  return `1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}`;
};

export default {
  formatCurrency,
  formatNumber,
  parseCurrency,
  calculateTotal,
  formatCompactCurrency,
  convertCurrency,
  formatForexRate,
};
