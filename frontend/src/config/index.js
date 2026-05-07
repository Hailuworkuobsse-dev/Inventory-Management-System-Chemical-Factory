// Application Configuration

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = 'AIMS - Advanced Inventory Management System';
export const APP_VERSION = '1.0.0';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_ITEMS_PER_PAGE = 25;

export const SCAN_DEBOUNCE_MS = 300;

export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const BATCH_STATUS = {
  PENDING: 'pending',
  QUARANTINE: 'quarantine',
  RELEASED: 'released',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

export const STOCK_MOVEMENT_TYPES = {
  RECEIPT: 'receipt',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
  SALE: 'sale',
  RETURN: 'return',
  PRODUCTION_CONSUMPTION: 'production_consumption',
  PRODUCTION_OUTPUT: 'production_output',
};
