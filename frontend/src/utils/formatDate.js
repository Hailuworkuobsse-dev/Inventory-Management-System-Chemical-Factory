/**
 * Format date to Ethiopian locale or standard format
 * Supports both Gregorian and Ethiopian calendar display
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided:', date);
    return '';
  }
  
  const {
    style = 'long',
    showTime = false,
    ethiopian = false,
  } = options;
  
  // Default options for Ethiopian locale
  const defaultOptions = {
    year: 'numeric',
    month: style === 'short' ? 'short' : 'long',
    day: 'numeric',
  };
  
  if (showTime) {
    defaultOptions.hour = '2-digit';
    defaultOptions.minute = '2-digit';
  }
  
  // For Ethiopian calendar, we use a simple approximation
  // In production, consider using a library like moment-ethiopic
  if (ethiopian) {
    return convertToEthiopianDate(dateObj);
  }
  
  try {
    return new Intl.DateTimeFormat('en-ET', defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to standard format
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  }
};

/**
 * Convert Gregorian date to Ethiopian date (approximate)
 * Ethiopian calendar is approximately 7-8 years behind Gregorian
 * @param {Date} gregorianDate 
 * @returns {string} Ethiopian date string
 */
const convertToEthiopianDate = (gregorianDate) => {
  // Ethiopian months
  const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 
    'Tir', 'Yekatit', 'Megabit', 'Miazia', 
    'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ];
  
  // Approximate conversion (simplified)
  const ethiopianYear = gregorianDate.getFullYear() - 8;
  const ethiopianMonthIndex = gregorianDate.getMonth();
  const ethiopianDay = gregorianDate.getDate();
  
  const monthName = ethiopianMonths[ethiopianMonthIndex] || ethiopianMonths[12];
  
  return `${monthName} ${ethiopianDay}, ${ethiopianYear}`;
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days from now")
 * @param {Date|string|number} date 
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = dateObj - now;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(-diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(-diffHours, 'hour');
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(-diffMins, 'minute');
  } else {
    return rtf.format(-diffSecs, 'second');
  }
};

/**
 * Format date range for reports
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate, { style: 'short' });
  const end = formatDate(endDate, { style: 'short' });
  return `${start} - ${end}`;
};

/**
 * Get days until expiry
 * @param {Date|string} expiryDate 
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 0;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffMs = expiry - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Format expiry countdown with color coding
 * @param {Date|string} expiryDate 
 * @returns {Object} { days, label, color, isExpired }
 */
export const formatExpiryCountdown = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  
  let color = 'success';
  let label = `${days} days remaining`;
  
  if (days < 0) {
    color = 'danger';
    label = `Expired ${Math.abs(days)} days ago`;
  } else if (days <= 30) {
    color = 'danger';
    label = `${days} days until expiry`;
  } else if (days <= 60) {
    color = 'warning';
    label = `${days} days until expiry`;
  } else if (days <= 90) {
    color = 'info';
    label = `${days} days until expiry`;
  }
  
  return {
    days,
    label,
    color,
    isExpired: days < 0,
  };
};

export default {
  formatDate,
  formatRelativeTime,
  formatDateRange,
  getDaysUntilExpiry,
  formatExpiryCountdown,
};
