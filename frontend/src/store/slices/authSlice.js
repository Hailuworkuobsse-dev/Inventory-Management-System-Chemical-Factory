import { createSlice } from '@reduxjs/toolkit';

// In httpOnly-cookie auth mode (VITE_AUTH_MODE=cookie) the JWT is never
// exposed to JS and nothing auth-related is persisted to localStorage.
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'token';

const readPersisted = (key) => {
  if (AUTH_MODE === 'cookie') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const initialState = {
  user: (() => {
    const raw = readPersisted('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  token: readPersisted('token'),
  refreshToken: readPersisted('refreshToken'),
  isAuthenticated: AUTH_MODE === 'cookie' ? false : !!readPersisted('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      if (AUTH_MODE !== 'cookie') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.refreshToken !== undefined) {
          state.refreshToken = action.payload.refreshToken;
          if (action.payload.refreshToken) {
            localStorage.setItem('refreshToken', action.payload.refreshToken);
          } else {
            localStorage.removeItem('refreshToken');
          }
        }
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      if (AUTH_MODE !== 'cookie') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (AUTH_MODE !== 'cookie') {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
