import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { server } from '../mocks/server';
import { store } from '../../store/store';
import { useGetStockQuery } from '../../services/inventoryEndpoints';
import { useOfflineMutation } from '../../hooks/useOfflineMutation';
import { setOnlineStatus } from '../../store/slices/offlineQueueSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); localStorage.clear(); });
afterAll(() => server.close());
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const wrap = (ui) => render(<Provider store={store}>{ui}</Provider>);

function StockProbe() {
  const { data, isSuccess } = useGetStockQuery();
  if (!isSuccess) return <span>loading</span>;
  return <ul>{data.map((r) => <li key={r.id}>{r.productName}</li>)}</ul>;
}


describe('journey: server-driven stock list', () => {
  it('renders stock rows fetched via RTK Query + MSW', async () => {
    wrap(<StockProbe />);
    await waitFor(() => expect(screen.getByText('Arabica Beans')).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByText('Robusta Beans')).toBeInTheDocument();
  });
});

describe('journey: offline goods receipt queue + sync', () => {
  it('queues a receipt while offline and replays it on reconnect', async () => {
    let calls = 0;
    function Probe() {
      const mod = useOfflineMutation;
      void mod;
      return null;
    }
    void Probe;
    // Directly exercise the online/offline mutation path with a fake trigger.
    const fakeTrigger = vi.fn(async (body) => ({ unwrap: async () => ({ id: ++calls, ...body }) }));
    function Runner() {
      const [run] = useOfflineMutation(fakeTrigger, { url: '/inventory/receipts', method: 'POST', endpointName: 'createReceipt' });
      return <button onClick={() => run({ sku: 'BEAN-001', qty: 10 })}>receive</button>;
    }
    const u = userEvent.setup();
    wrap(<Runner />);

    // go offline -> enqueue instead of calling API
    store.dispatch(setOnlineStatus(false));
    await u.click(screen.getByText('receive'));
    await waitFor(() => expect(store.getState().offlineQueue.items).toHaveLength(1));
    expect(fakeTrigger).not.toHaveBeenCalled();

    // reconnect -> syncQueue replays against MSW-backed endpoint
    global.fetch = fetch; // ensure real fetch (MSW intercepts) for sync worker
    store.dispatch(setOnlineStatus(true));
    const { syncQueue } = await import('../../store/slices/offlineQueueSlice');
    await store.dispatch(syncQueue());
    await waitFor(() => expect(store.getState().offlineQueue.items).toHaveLength(0), { timeout: 5000 });
  });
});
