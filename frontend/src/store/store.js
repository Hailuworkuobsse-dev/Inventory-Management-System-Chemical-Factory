import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import offlineQueueReducer from './slices/offlineQueueSlice';
import { apiSlice } from '../services/apiSlice';

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
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
