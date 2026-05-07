import React from 'react';
import { Navigate } from 'react-router-dom';
import usePermission from '../hooks/usePermission';

const RoleGuard = ({ allowedRoles, children }) => {
  const { checkAnyRole, user } = usePermission();

  if (!user) {
    // Should be handled by ProtectedRoute
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    // No role restrictions
    return children;
  }

  if (!checkAnyRole(allowedRoles)) {
    // User doesn't have any of the required roles
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// HOC for easier usage
export const withRoleGuard = (WrappedComponent, allowedRoles) => {
  return function WithRoleGuard(props) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
};

export default RoleGuard;
