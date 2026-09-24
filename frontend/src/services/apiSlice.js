import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import toast from 'react-hot-toast';
import { logout } from '../store/slices/authSlice';
import { refreshAuthToken, isAuthEndpoint } from '../lib/authRefresh';

/**
 * When the backend is configured for httpOnly-cookie sessions
 * (VITE_AUTH_MODE=cookie), the JWT lives only in an httpOnly cookie and the
 * access token is never exposed to JS. Requests then rely on `credentials:
 * 'include'` instead of an Authorization header.
 */
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'token';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // send/receive cookies so httpOnly-session auth works when enabled server-side
  credentials: AUTH_MODE === 'cookie' ? 'include' : 'same-origin',
  prepareHeaders: (headers, { getState }) => {
    if (AUTH_MODE !== 'cookie') {
      const token = getState()?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * baseQuery wrapper with silent refresh-and-retry:
 * on 401 (except for auth endpoints) it attempts a single token refresh and
 * replays the original request. If refreshing fails the user is logged out.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args?.url || '';
  const status = result?.error?.status;

  if (status === 401 && !isAuthEndpoint(url)) {
    const newToken = await refreshAuthToken(); // dispatches auth/logout on failure
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions); // retry once with fresh token
    } else {
      api.dispatch(logout());
    }
  } else if (
    typeof status === 'number' &&
    status >= 400 &&
    !args?.silent &&
    !isAuthEndpoint(url)
  ) {
    // Global UX-reliability net: surface every unhandled 4xx/5xx as a toast.
    // Mutations opt out with `meta: { silent: true }` when they render their
    // own inline error UI or queue the request offline.
    const data = result?.error?.data;
    const message =
      (typeof data === 'string' ? data : data?.message) ||
      `Request failed (${status})`;
    toast.error(message);
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Inventory',
    'Receipts',
    'Sales',
    'Returns',
    'Purchases',
    'Suppliers',
    'ForexRates',
    'Quality',
    'Boms',
    'WorkOrders',
    'Users',
    'Roles',
    'Permissions',
    'Reports',
  ],
  endpoints: () => ({}),
});

export default apiSlice;
