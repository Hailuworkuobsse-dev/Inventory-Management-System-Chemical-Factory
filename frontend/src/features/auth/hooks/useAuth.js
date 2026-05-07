import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout } from '../../store/slices/authSlice';
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
} from '../../../services/authEndpoints';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const [error, setError] = useState(null);
  
  // RTK Query hooks
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const [changePasswordMutation] = useChangePasswordMutation();
  
  const login = async (credentials) => {
    dispatch(loginStart());
    setError(null);

    try {
      const response = await loginMutation(credentials).unwrap();
      dispatch(loginSuccess(response));
      navigate('/dashboard');
      return response;
    } catch (err) {
      const errorMessage = err?.data?.message || err?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await refreshTokenMutation().unwrap();
      
      dispatch(loginSuccess({ token: response.token, user }));
      return response;
    } catch (err) {
      dispatch(logout());
      navigate('/login');
      throw err;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await changePasswordMutation(passwordData).unwrap();
      return { success: true };
    } catch (err) {
      const errorMessage = err?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasRole = (role) => {
    if (!user || !user.role) {
      return false;
    }
    return user.role === role || user.role === 'super_admin';
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout: logoutUser,
    refreshToken,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasRole,
  };
};

export default useAuth;
