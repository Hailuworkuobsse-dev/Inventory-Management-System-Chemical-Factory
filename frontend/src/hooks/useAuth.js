import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, updateUser, clearError } from '../store/slices/authSlice';
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
} from '../services/authEndpoints';

/**
 * Single source of truth for authentication.
 *
 * - Auth state (user/token/isAuthenticated) lives in the Redux `auth` slice.
 * - Network calls go through RTK Query (`services/authEndpoints`).
 * - This hook is a thin wrapper that combines selectors with actions so
 *   components and route guards never touch localStorage or fetch directly.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [loginRequest] = useLoginMutation();
  const [logoutRequest] = useLogoutMutation();
  const [refreshTokenRequest] = useRefreshTokenMutation();
  const [changePasswordRequest] = useChangePasswordMutation();

  const login = useCallback(
    async (credentials) => {
      dispatch(loginStart());
      try {
        const response = await loginRequest(credentials).unwrap();
        // Normalize: accept { user, token } or { user, accessToken } payloads.
        const data = {
          user: response.user ?? response,
          token: response.token || response.accessToken || '',
          refreshToken: response.refreshToken || '',
        };
        if (!data.user) throw new Error('Invalid login response');
        dispatch(loginSuccess(data));
        navigate('/dashboard');
        return data;
      } catch (err) {
        const message = err?.data?.message || err?.message || 'Login failed';
        dispatch(loginFailure(message));
        throw err;
      }
    },
    [dispatch, navigate, loginRequest]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest().unwrap();
    } catch {
      // Even if the server call fails we must clear local auth state.
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  }, [dispatch, navigate, logoutRequest]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await refreshTokenRequest().unwrap();
      dispatch(
        loginSuccess({
          token: response.token || response.accessToken,
          user: response.user ?? user,
          refreshToken: response.refreshToken, // undefined → keep existing
        })
      );
      return response;
    } catch (err) {
      dispatch(logoutAction());
      navigate('/login');
      throw err;
    }
  }, [dispatch, navigate, refreshTokenRequest, user]);

  const changePassword = useCallback(
    async (passwordData) => {
      try {
        await changePasswordRequest(passwordData).unwrap();
        return { success: true };
      } catch (err) {
        return { success: false, error: err?.data?.message || 'Password change failed' };
      }
    },
    [changePasswordRequest]
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role?.name === 'admin' || user.isSuperUser) return true;
      return (
        user.permissions?.includes(permission) || user.role?.permissions?.includes(permission) || false
      );
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions = []) => permissions.some((p) => hasPermission(p)),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions = []) => permissions.every((p) => hasPermission(p)),
    [hasPermission]
  );

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
      return roleName === role || roleName === 'super_admin';
    },
    [user]
  );

  const checkAnyRole = useCallback(
    (roles = []) => roles.some((r) => hasRole(r)),
    [hasRole]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading: loading,
    error,
    login,
    logout,
    refreshToken,
    changePassword,
    updateUser: (patch) => dispatch(updateUser(patch)),
    clearError: () => dispatch(clearError()),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    checkAnyRole,
  };
};

export default useAuth;
