import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import 'fake-indexeddb/auto';
import offlineQueueReducer, {
  loadQueue,
  enqueueOffline,
  syncQueue,
  resolveConflict,
  queueItemAdded,
} from '../offlineQueueSlice';
import authReducer from '../authSlice';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const makeStore = () =>
  configureStore({
    reducer: { offlineQueue: offlineQueueReducer, auth: authReducer },
    middleware: (gdm) => gdm({ serializableCheck: false, thunk: { extraArgument: { invapi: undefined } } }),
  });

beforeEach(() => {
  localStorage.clear();
});

describe('offline queue', () => {
  it('enqueueOffline persists an item and mirrors it in Redux state', async () => {
    const store = makeStore();
    const action = await store.dispatch(
      enqueueOffline({ url: '/inventory/receipts', method: 'POST', body: { sku: 'X' }, label: 'Receipt' })
    );
    expect(action.payload.id).toBeDefined();
    const items = store.getState().offlineQueue.items;
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe('pending');
    expect(items[0].retryCount).toBe(0);
  });

  it('loadQueue hydrates persisted items oldest-first', async () => {
    const s1 = makeStore();
    await s1.dispatch(enqueueOffline({ url: '/a', method: 'POST', body: {} }));
    await new Promise((r) => setTimeout(r, 5));
    await s1.dispatch(enqueueOffline({ url: '/b', method: 'POST', body: {} }));

    const s2 = makeStore();
    const action = await s2.dispatch(loadQueue());
    expect(action.payload.length).toBe(2);
    expect(new Date(action.payload[0].timestamp) <= new Date(action.payload[1].timestamp)).toBe(true);
  });

  it('syncQueue replays pending items and removes them on 2xx', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    const store = makeStore();
    store.dispatch(queueItemAdded({ id: 1, url: '/x', method: 'POST', body: {}, status: 'pending', retryCount: 0, maxRetries: 5, timestamp: new Date().toISOString() }));
    const res = await store.dispatch(syncQueue());
    expect(res.payload).toMatchObject({ synced: 1, total: 1 });
    expect(store.getState().offlineQueue.items).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('syncQueue marks 409 responses as conflict', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({}) });
    const store = makeStore();
    await store.dispatch(enqueueOffline({ url: '/conflict', method: 'POST', body: {} }));
    const res = await store.dispatch(syncQueue());
    expect(res.payload.conflicts).toBe(1);
    expect(store.getState().offlineQueue.items[0].status).toBe('conflict');
  });

  it('syncQueue fails after maxRetries on 5xx', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const store = makeStore();
    store.dispatch(queueItemAdded({ id: 9, url: '/err', method: 'POST', body: {}, status: 'pending', retryCount: 4, maxRetries: 5, timestamp: new Date().toISOString() }));
    const res = await store.dispatch(syncQueue());
    expect(res.payload.failed).toBe(1);
    expect(store.getState().offlineQueue.items[0].status).toBe('failed');
  });

  it('syncQueue leaves items pending on network failure with incremented retryCount', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const store = makeStore();
    await store.dispatch(enqueueOffline({ url: '/net', method: 'POST', body: {} }));
    await store.dispatch(syncQueue());
    const item = store.getState().offlineQueue.items[0];
    expect(item.status).toBe('pending');
    expect(item.retryCount).toBe(1);
  });

  it('resolveConflict discards or re-queues an item', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({}) });
    const store = makeStore();
    const enq = await store.dispatch(enqueueOffline({ url: '/c', method: 'POST', body: {} }));
    const id = enq.payload.id;
    await store.dispatch(syncQueue()); // -> conflict
    await store.dispatch(resolveConflict({ id, action: 'retry' }));
    expect(store.getState().offlineQueue.items[0]).toMatchObject({ status: 'pending', retryCount: 0 });
    await store.dispatch(resolveConflict({ id, action: 'discard' }));
    expect(store.getState().offlineQueue.items).toHaveLength(0);
  });
});
