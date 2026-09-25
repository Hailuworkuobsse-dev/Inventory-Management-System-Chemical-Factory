import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import offlineQueueReducer from './slices/offlineQueueSlice';
import { apiSlice } from '../services/apiSlice';
import { injectStore } from '../lib/authRefresh';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    offlineQueue: offlineQueueReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for File/Blob
        ignoredActions: ['files/upload'],
        // Ignore these field paths in state
        ignoredPaths: ['auth.user.avatar'],
      },
      thunk: { extraArgument: { invapi: apiSlice } },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

injectStore(store);

// RTK Query refetch-on-focus/reconnect listeners (no-op outside browsers)
setupListeners(store.dispatch);

export default store;
