import { useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook for checking user permissions
 */
export const usePermission = () => {
  const user = useSelector((state) => state.auth?.user);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      
      // Check if user has the permission directly
      if (user.permissions?.includes(permission)) {
        return true;
      }
      
      // Check if user's role has the permission
      if (user.role?.permissions?.includes(permission)) {
        return true;
      }
      
      // Check for admin/superuser override
      if (user.role?.name === 'admin' || user.isSuperUser) {
        return true;
      }
      
      return false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!permissions || permissions.length === 0) return true;
      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!permissions || permissions.length === 0) return true;
      return permissions.every((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  const can = useCallback(
    (permission) => hasPermission(permission),
    [hasPermission]
  );

  const cannot = useCallback(
    (permission) => !hasPermission(permission),
    [hasPermission]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    cannot,
    user,
  };
};

export default usePermission;
