import { useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Thin wrapper around the canonical `useAuth` hook, kept for backwards
 * compatibility with components that import permission helpers directly.
 */
export const usePermission = () => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, checkAnyRole } = useAuth();

  const can = useCallback((permission) => hasPermission(permission), [hasPermission]);
  const cannot = useCallback((permission) => !hasPermission(permission), [hasPermission]);

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    checkAnyRole,
    can,
    cannot,
  };
};

export default usePermission;
