import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RefreshCw, CloudOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { syncQueue, resolveConflict } from '../store/slices/offlineQueueSlice';

/**
 * SyncStatusBadge — visible offline/queue/sync status.
 * Shows: offline indicator, pending queue count, syncing spinner,
 * and a conflict panel with retry/discard actions.
 */
const SyncStatusBadge = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { items, isOnline, syncing, lastSyncResult } = useSelector((state) => state.offlineQueue);

  const pending = items.filter((i) => i.status === 'pending');
  const conflicts = items.filter((i) => i.status === 'conflict');
  const failed = items.filter((i) => i.status === 'failed' || i.status === 'failed_max_retries');

  if (isOnline && !syncing && pending.length === 0 && conflicts.length === 0 && failed.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          conflicts.length || failed.length
            ? 'bg-red-50 text-red-700 border-red-200'
            : !isOnline
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}
        aria-label="Sync status"
      >
        {syncing ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : conflicts.length || failed.length ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : !isOnline ? (
          <CloudOff className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        {!isOnline && 'Offline'}
        {isOnline && syncing && 'Syncing…'}
        {isOnline && !syncing && pending.length > 0 && `${pending.length} pending`}
        {(conflicts.length > 0 || failed.length > 0) &&
          ` ${conflicts.length + failed.length} need attention`}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">Offline sync</span>
            {isOnline && pending.length > 0 && (
              <button
                onClick={() => dispatch(syncQueue())}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sync now
              </button>
            )}
          </div>

          {lastSyncResult && (
            <p className="text-xs text-gray-500 mb-2">
              Last sync: {lastSyncResult.synced} synced, {lastSyncResult.failed} failed
              {lastSyncResult.conflicts ? `, ${lastSyncResult.conflicts} conflicts` : ''}
            </p>
          )}

          {items.length === 0 && <p className="text-gray-500">Queue is empty.</p>}

          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="border border-gray-100 rounded p-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{item.label || item.url}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      item.status === 'conflict' || item.status.startsWith('failed')
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {item.method} {item.url} · {new Date(item.timestamp).toLocaleString()}
                  {item.retryCount ? ` · retries ${item.retryCount}` : ''}
                </p>
                {item.lastError && (
                  <p className="text-xs text-red-600 mt-1">{item.lastError}</p>
                )}
                {item.status === 'conflict' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => dispatch(resolveConflict({ id: item.id, action: 'retry' }))}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => dispatch(resolveConflict({ id: item.id, action: 'discard' }))}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Discard
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SyncStatusBadge;
