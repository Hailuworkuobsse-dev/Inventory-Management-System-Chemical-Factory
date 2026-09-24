import { createSlice } from '@reduxjs/toolkit';
import { openDB, addToStore, getAllFromStore, deleteFromStore } from '../../lib/idb';

const QUEUE_STORE = 'syncQueue';

const initialState = {
  items: [], // hydrated from IndexedDB by loadQueue()
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncing: false,
  lastSyncResult: null, // { synced, failed, total, at }
};

/**
 * Single source of truth for the offline mutation queue.
 * Persistence lives in IndexedDB (lib/idb — PharmaERP_DB / syncQueue store);
 * Redux mirrors it so components can render sync status reactively.
 */
const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    queueLoaded: (state, action) => {
      state.items = action.payload;
    },
    queueItemAdded: (state, action) => {
      state.items.push(action.payload);
    },
    queueItemRemoved: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    queueItemUpdated: (state, action) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
    queueCleared: (state) => {
      state.items = [];
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setSyncing: (state, action) => {
      state.syncing = action.payload;
    },
    syncFinished: (state, action) => {
      state.syncing = false;
      state.lastSyncResult = { ...action.payload, at: new Date().toISOString() };
    },
  },
});

export const {
  queueLoaded,
  queueItemAdded,
  queueItemRemoved,
  queueItemUpdated,
  queueCleared,
  setOnlineStatus,
  setSyncing,
  syncFinished,
} = offlineQueueSlice.actions;

/* --------------------------- async thunks ------------------------------ */

import { createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { refreshAuthToken } from '../../lib/authRefresh';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const loadQueue = createAsyncThunk('offlineQueue/load', async () => {
  const db = await openDB();
  void db; // ensure DB exists
  const items = await getAllFromStore(QUEUE_STORE);
  return items.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
});

export const enqueueOffline = createAsyncThunk(
  'offlineQueue/enqueue',
  async (entry, { dispatch }) => {
    const item = {
      ...entry,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      maxRetries: 5,
    };
    const id = await addToStore(QUEUE_STORE, item); // put() -> returns key
    const saved = { ...item, id };
    dispatch(queueItemAdded(saved));
    return saved;
  }
);

export const resolveConflict = createAsyncThunk(
  'offlineQueue/resolveConflict',
  async ({ id, action }, { dispatch }) => {
    // action: 'discard' | 'retry'
    if (action === 'discard') {
      await deleteFromStore(QUEUE_STORE, id);
      dispatch(queueItemRemoved(id));
    } else {
      const items = await getAllFromStore(QUEUE_STORE);
      const item = items.find((i) => i.id === id);
      if (item) {
        const updated = { ...item, status: 'pending', retryCount: 0 };
        await addToStore(QUEUE_STORE, updated);
        dispatch(queueItemUpdated({ id, status: 'pending', retryCount: 0, lastError: undefined }));
      }
    }
  }
);

const authHeaders = async (getState) => {
  const headers = { 'Content-Type': 'application/json' };
  let token = getState()?.auth?.token || localStorage.getItem('token');
  if (!token) {
    token = await refreshAuthToken();
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

/**
 * Replay all pending queued mutations against the API, oldest first.
 * - 409 responses are marked "conflict" (surfaced to the user for resolution)
 * - 5xx / network errors keep the item pending with an incremented retryCount
 * - other 4xx are marked "failed" (won't succeed on retry)
 */
export const syncQueue = createAsyncThunk(
  'offlineQueue/sync',
  async (_, { getState, dispatch, extra }) => {
    const state = getState();
    const pending = (state.offlineQueue.items || []).filter(
      (i) => i.status === 'pending' || i.status === 'retry'
    );
    if (pending.length === 0) {
      return { synced: 0, failed: 0, conflicts: 0, total: 0 };
    }

    const headers = await authHeaders(getState);
    const result = { synced: 0, failed: 0, conflicts: 0, total: pending.length };

    for (const item of pending) {
      try {
        const res = await fetch(`${BASE_URL}${item.url}`, {
          method: item.method || 'POST',
          headers,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (res.ok) {
          await deleteFromStore(QUEUE_STORE, item.id);
          dispatch(queueItemRemoved(item.id));
          result.synced += 1;
          if (item.endpointName && extra?.invapi) {
            dispatch(
              extra.invapi.util.invalidateTags([
                item.endpointName,
                // also drop any cached GET results for the mutated path so the
                // UI refetches authoritative server state after a sync
                { type: 'InvalidatedPath', path: item.url },
              ])
            );
          }
        } else if (res.status === 409) {
          await addToStore(QUEUE_STORE, {
            ...item,
            status: 'conflict',
            lastError: 'Server conflict — needs manual resolution',
          });
          dispatch(queueItemUpdated({ id: item.id, status: 'conflict', lastError: 'Conflict (409)' }));
          result.conflicts += 1;
        } else if (res.status >= 500) {
          const retryCount = (item.retryCount || 0) + 1;
          const status = retryCount >= item.maxRetries ? 'failed' : 'pending';
          await addToStore(QUEUE_STORE, { ...item, retryCount, status });
          dispatch(queueItemUpdated({ id: item.id, retryCount, status }));
          if (status === 'failed') result.failed += 1;
        } else {
          await addToStore(QUEUE_STORE, {
            ...item,
            status: 'failed',
            lastError: `HTTP ${res.status}`,
          });
          dispatch(queueItemUpdated({ id: item.id, status: 'failed', lastError: `HTTP ${res.status}` }));
          result.failed += 1;
        }
      } catch (err) {
        // Network still down — leave pending, count retry
        const retryCount = (item.retryCount || 0) + 1;
        const status = retryCount >= item.maxRetries ? 'failed' : 'pending';
        await addToStore(QUEUE_STORE, { ...item, retryCount, status });
        dispatch(queueItemUpdated({ id: item.id, retryCount, status }));
      }
    }

    // Surface sync outcomes instead of silent success/failure
    if (result.synced > 0) {
      toast.success(`Synced ${result.synced} queued operation${result.synced > 1 ? 's' : ''}`);
    }
    if (result.conflicts > 0) {
      toast.error(`${result.conflicts} operation${result.conflicts > 1 ? 's' : ''} need attention (conflict)`);
    }
    if (result.failed > 0) {
      toast.error(`${result.failed} operation${result.failed > 1 ? 's' : ''} failed — open the sync panel`);
    }

    return result;
  }
);

export default offlineQueueSlice.reducer;
