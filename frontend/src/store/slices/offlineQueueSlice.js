import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  queue: [],
  isOnline: navigator.onLine,
};

const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    addToQueue: (state, action) => {
      state.queue.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  addToQueue,
  removeFromQueue,
  clearQueue,
  setOnlineStatus,
} = offlineQueueSlice.actions;

export default offlineQueueSlice.reducer;
