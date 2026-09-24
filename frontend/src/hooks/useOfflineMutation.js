import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueOffline } from '../store/slices/offlineQueueSlice';

/**
 * useOfflineMutation — unified online/offline mutation path.
 *
 * Wraps an RTK Query mutation trigger so that:
 *  - online  -> request goes straight to the API; a transient network failure
 *               (no HTTP response) is transparently queued for later sync.
 *  - offline -> request is persisted to IndexedDB via the offlineQueue slice
 *               and replayed by syncQueue when connectivity returns.
 *
 * @param {Function} trigger   RTK Query mutation trigger, e.g. useCreateReceiptMutation()[0]
 * @param {Object}   options   { url, method?, endpointName? } — endpointName must match a
 *                             query tag/endpoint name used for cache invalidation after sync.
 * @returns {[Function, {queued: boolean}]} [run, meta] — run(body) resolves to
 *          { status: 'ok'|'queued', data?, queueId? }
 */
export const useOfflineMutation = (trigger, { url, method = 'POST', endpointName } = {}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state) => state.offlineQueue.isOnline);

  const run = useCallback(
    async (body) => {
      const entry = { url, method, body, label: options_label(endpointName, url), endpointName };

      if (!isOnline) {
        const action = await dispatch(enqueueOffline(entry));
        return { status: 'queued', queueId: action.payload?.id };
      }

      try {
        const res = await trigger(body).unwrap();
        return { status: 'ok', data: res };
      } catch (err) {
        // Network-level failure (offline mid-flight) -> queue it instead of failing hard
        const isNetworkError = err?.status === 'FETCH_ERROR' || err?.error instanceof TypeError;
        if (isNetworkError) {
          const action = await dispatch(enqueueOffline(entry));
          return { status: 'queued', queueId: action.payload?.id };
        }
        throw err; // real API error (4xx/5xx) — caller shows the error UI
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trigger, isOnline, url, method, endpointName]
  );

  return [run, { queued: !isOnline }];
};

const options_label = (endpointName, url) => endpointName || url;

export default useOfflineMutation;
