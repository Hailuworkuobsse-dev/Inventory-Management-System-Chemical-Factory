import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadQueue, syncQueue, setOnlineStatus } from '../store/slices/offlineQueueSlice';

/**
 * useOfflineSync — mounts the offline queue once at app level.
 * - hydrates the Redux mirror of the IndexedDB queue on mount
 * - keeps isOnline in sync with browser connectivity events
 * - triggers syncQueue automatically when connection is restored
 */
export const useOfflineSync = () => {
  const dispatch = useDispatch();
  const { items, isOnline } = useSelector((state) => state.offlineQueue);

  useEffect(() => {
    dispatch(loadQueue());

    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      dispatch(syncQueue());
    };
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // If we boot while already online and something is pending, flush it.
  useEffect(() => {
    if (isOnline && items.some((i) => i.status === 'pending')) {
      dispatch(syncQueue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return { isOnline, pendingCount: items.filter((i) => i.status === 'pending').length };
};

export default useOfflineSync;
