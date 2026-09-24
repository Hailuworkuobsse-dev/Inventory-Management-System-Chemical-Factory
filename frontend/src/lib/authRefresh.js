import { store } from '../store/store';

/**
 * Shared token-refresh helper used by both the axios interceptor and the
 * RTK Query baseQueryWithReauth wrapper.
 *
 * - Reads the current access/refresh tokens from Redux (single source of truth).
 * - Calls POST /auth/refresh directly with fetch (bypasses interceptors to
 *   avoid infinite retry loops).
 * - On success dispatches loginSuccess so authSlice + localStorage update.
 * - On failure dispatches logout (hard logout) and returns null.
 *
 * Concurrent callers share a single in-flight refresh promise.
 */
let refreshInFlight = null;

export const refreshAuthToken = () => {
  if (refreshInFlight) return refreshInFlight;

  const run = (async () => {
    const state = store.getState();
    const refreshToken = state.auth?.refreshToken;
    const user = state.auth?.user;
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const cookieMode = import.meta.env.VITE_AUTH_MODE === 'cookie';

    if (!refreshToken && !cookieMode) {
      store.dispatch({ type: 'auth/logout' });
      return null;
    }

    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // cookie mode: the refresh token rides in an httpOnly cookie
        credentials: cookieMode ? 'include' : 'same-origin',
        body: JSON.stringify(cookieMode ? {} : { refreshToken }),
      });
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      const data = await res.json();
      const token = data.token || data.accessToken;
      if (!token && !cookieMode) throw new Error('Refresh response missing token');
      store.dispatch({
        type: 'auth/loginSuccess',
        payload: { user: data.user ?? user, token: token ?? null, refreshToken: data.refreshToken ?? refreshToken },
      });
      return token;
    } catch {
      store.dispatch({ type: 'auth/logout' });
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  refreshInFlight = run;
  return run;
};

/**
 * Guard against infinite retry loops: never attempt to refresh the auth
 * endpoints themselves (login/refresh/register/password resets).
 */
export const isAuthEndpoint = (url = '') => /\/auth\/(login|refresh|register|forgot-password|reset-password)/.test(url);

export default refreshAuthToken;
