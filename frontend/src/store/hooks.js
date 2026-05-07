import { useSelector, useDispatch } from 'react-redux';
import { 
  useLazyQuery, 
  useMutation, 
  useQuery 
} from '@reduxjs/toolkit/query/react';

// Typed hooks for Redux
export const useAppSelector = useSelector;
export const useAppDispatch = () => useDispatch();

// Custom hook for selecting auth state
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

// Custom hook for selecting UI state
export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Custom hook for selecting offline queue state
export const useOfflineQueue = () => {
  return useAppSelector((state) => state.offlineQueue);
};

// Custom hook for checking user permissions
export const usePermission = (permission) => {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return user.permissions.includes(permission);
};

// Custom hook for checking multiple permissions (any)
export const useAnyPermission = (permissions) => {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return permissions.some((perm) => user.permissions.includes(perm));
};

// Custom hook for checking multiple permissions (all)
export const useAllPermissions = (permissions) => {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return permissions.every((perm) => user.permissions.includes(perm));
};

// Custom hook for online status
export const useOnlineStatus = () => {
  const { isOnline } = useOfflineQueue();
  return isOnline;
};

// Custom hook for current user roles
export const useUserRoles = () => {
  const { user } = useAuth();
  return user?.roles || [];
};

// Custom hook for checking user role
export const useHasRole = (role) => {
  const roles = useUserRoles();
  return roles.includes(role);
};

// Custom hook for checking any of multiple roles
export const useHasAnyRole = (roles) => {
  const userRoles = useUserRoles();
  return roles.some((role) => userRoles.includes(role));
};

// Custom hook for warehouse context
export const useWarehouse = () => {
  const { selectedWarehouse } = useUI();
  return selectedWarehouse;
};

export default {
  useAppSelector,
  useAppDispatch,
  useAuth,
  useUI,
  useOfflineQueue,
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useOnlineStatus,
  useUserRoles,
  useHasRole,
  useHasAnyRole,
  useWarehouse,
};
