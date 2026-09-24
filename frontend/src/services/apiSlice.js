import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../store/slices/authSlice';
import { refreshAuthToken, isAuthEndpoint } from '../lib/authRefresh';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
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
