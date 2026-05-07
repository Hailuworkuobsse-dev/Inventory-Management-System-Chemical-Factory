import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../services/apiSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [error, setError] = useState(null);

  const login = async (credentials) => {
    dispatch(loginStart());
    setError(null);

    try {
      // Using RTK Query mutation - will be defined in auth endpoints
      const response = await dispatch(
        apiSlice.endpoints.login.initiate(credentials)
      ).unwrap();

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
      await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await dispatch(
        apiSlice.endpoints.refreshToken.initiate()
      ).unwrap();
      
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
      await dispatch(
        apiSlice.endpoints.changePassword.initiate(passwordData)
      ).unwrap();
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
