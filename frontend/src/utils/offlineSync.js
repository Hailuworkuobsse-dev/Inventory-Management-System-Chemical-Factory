/**
 * Offline synchronization utilities for PWA
 * Manages transaction queue, IndexedDB storage, and sync operations
 */

const DB_NAME = 'aims_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

/**
 * Add transaction to offline queue
 * @param {Object} transaction - Transaction data { type, payload, endpoint, method }
 * @returns {Promise<number>} Transaction ID
 */
export const addToQueue = async (transaction) => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const item = {
        ...transaction,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
      };
      
      const request = store.add(item);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to add to queue'));
      };
    });
  } catch (error) {
    console.error('Error adding to offline queue:', error);
    throw error;
  }
};

/**
 * Get all pending transactions from queue
 * @returns {Promise<Array>}
 */
export const getQueue = async () => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('status');
      
      const request = index.getAll('pending');
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get queue'));
      };
    });
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

/**
 * Update transaction status in queue
 * @param {number} id - Transaction ID
 * @param {string} status - New status
 * @param {Object} error - Optional error object
 * @returns {Promise<void>}
 */
export const updateTransactionStatus = async (id, status, error = null) => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          item.updatedAt = new Date().toISOString();
          
          if (error) {
            item.lastError = error.message || error;
            item.retryCount = (item.retryCount || 0) + 1;
          }
          
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to update status'));
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(new Error('Failed to get transaction'));
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Remove transaction from queue
 * @param {number} id - Transaction ID
 * @returns {Promise<void>}
 */
export const removeFromQueue = async (id) => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove from queue'));
    });
  } catch (error) {
    console.error('Error removing from offline queue:', error);
    throw error;
  }
};

/**
 * Clear entire queue
 * @returns {Promise<void>}
 */
export const clearQueue = async () => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear queue'));
    });
  } catch (error) {
    console.error('Error clearing offline queue:', error);
    throw error;
  }
};

/**
 * Sync queued transactions with server
 * @param {Function} apiCall - Function to call API (axios instance)
 * @param {Function} onSuccess - Callback for successful sync
 * @param {Function} onError - Callback for failed sync
 * @returns {Promise<Object>} Sync result summary
 */
export const syncQueue = async (apiCall, onSuccess, onError) => {
  const queue = await getQueue();
  
  if (queue.length === 0) {
    return { synced: 0, failed: 0, total: 0 };
  }
  
  const results = {
    synced: 0,
    failed: 0,
    total: queue.length,
    details: [],
  };
  
  for (const item of queue) {
    try {
      // Check if max retries exceeded
      if ((item.retryCount || 0) >= item.maxRetries) {
        await updateTransactionStatus(item.id, 'failed_max_retries');
        results.failed++;
        results.details.push({
          id: item.id,
          status: 'failed_max_retries',
          type: item.type,
        });
        
        if (onError) {
          onError(item, new Error('Max retries exceeded'));
        }
        continue;
      }
      
      // Make API call
      const response = await apiCall({
        method: item.method || 'POST',
        url: item.endpoint,
        data: item.payload,
      });
      
      // Success
      await removeFromQueue(item.id);
      results.synced++;
      results.details.push({
        id: item.id,
        status: 'synced',
        type: item.type,
      });
      
      if (onSuccess) {
        onSuccess(item, response);
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 409) {
        // Conflict - needs manual resolution
        await updateTransactionStatus(item.id, 'conflict', error);
        results.failed++;
        results.details.push({
          id: item.id,
          status: 'conflict',
          type: item.type,
          error: error.message,
        });
        
        if (onError) {
          onError(item, error);
        }
      } else if (error.response?.status >= 500) {
        // Server error - retry later
        await updateTransactionStatus(item.id, 'pending', error);
        results.failed++;
        results.details.push({
          id: item.id,
          status: 'retry_later',
          type: item.type,
        });
      } else {
        // Client error - likely won't succeed on retry
        await updateTransactionStatus(item.id, 'failed', error);
        results.failed++;
        results.details.push({
          id: item.id,
          status: 'failed',
          type: item.type,
          error: error.message,
        });
        
        if (onError) {
          onError(item, error);
        }
      }
    }
  }
  
  return results;
};

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
export const getQueueStats = async () => {
  const queue = await getQueue();
  
  const stats = {
    total: queue.length,
    pending: queue.filter((i) => i.status === 'pending').length,
    conflict: queue.filter((i) => i.status === 'conflict').length,
    failed: queue.filter((i) => i.status === 'failed' || i.status === 'failed_max_retries').length,
    byType: {},
  };
  
  // Count by type
  queue.forEach((item) => {
    if (!stats.byType[item.type]) {
      stats.byType[item.type] = 0;
    }
    stats.byType[item.type]++;
  });
  
  return stats;
};

/**
 * Check if there are any conflicts requiring resolution
 * @returns {Promise<boolean>}
 */
export const hasConflicts = async () => {
  const queue = await getQueue();
  return queue.some((item) => item.status === 'conflict');
};

/**
 * Get conflicting transactions
 * @returns {Promise<Array>}
 */
export const getConflicts = async () => {
  const queue = await getQueue();
  return queue.filter((item) => item.status === 'conflict');
};

/**
 * Create offline transaction wrapper for API calls
 * @param {Object} config - { type, endpoint, method, payload }
 * @param {boolean} isOnline - Current online status
 * @param {Function} apiCall - API call function
 * @returns {Promise<Object>} Response or queued confirmation
 */
export const createOfflineTransaction = async (config, isOnline, apiCall) => {
  if (isOnline) {
    // Try direct API call
    try {
      const response = await apiCall({
        method: config.method || 'POST',
        url: config.endpoint,
        data: config.payload,
      });
      
      return {
        success: true,
        offline: false,
        data: response.data,
      };
    } catch (error) {
      // If network error, queue for later
      if (!navigator.onLine || error.code === 'ERR_NETWORK') {
        const id = await addToQueue(config);
        return {
          success: true,
          offline: true,
          queued: true,
          queueId: id,
          message: 'Offline - queued for sync',
        };
      }
      
      throw error;
    }
  } else {
    // Definitely offline, queue immediately
    const id = await addToQueue(config);
    return {
      success: true,
      offline: true,
      queued: true,
      queueId: id,
      message: 'Offline - queued for sync',
    };
  }
};

/**
 * Initialize offline sync listeners
 * @param {Function} syncCallback - Callback when sync completes
 */
export const initOfflineSync = (syncCallback) => {
  // Listen for online events
  window.addEventListener('online', async () => {
    console.log('Connection restored, syncing...');
    // Auto-sync when back online
    // Note: apiCall should be provided by the caller
    if (syncCallback) {
      syncCallback();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Connection lost, entering offline mode');
  });
};

export default {
  addToQueue,
  getQueue,
  updateTransactionStatus,
  removeFromQueue,
  clearQueue,
  syncQueue,
  getQueueStats,
  hasConflicts,
  getConflicts,
  createOfflineTransaction,
  initOfflineSync,
};
