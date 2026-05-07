/**
 * Permission checking utilities for role-based access control
 * Maps user permissions to UI actions and route guards
 */

// Permission constants - matches backend permission strings
export const PERMISSIONS = {
  // Inventory permissions
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',
  
  // Quality permissions
  QUALITY_READ: 'quality:read',
  QUALITY_WRITE: 'quality:write',
  QUALITY_APPROVE: 'quality:approve',
  QUARANTINE_RELEASE: 'quarantine:release',
  BATCH_RECALL: 'batch:recall',
  LAB_TEST_CREATE: 'lab_test:create',
  
  // Procurement permissions
  PROCUREMENT_READ: 'procurement:read',
  PROCUREMENT_WRITE: 'procurement:write',
  PO_CREATE: 'po:create',
  PO_APPROVE: 'po:approve',
  FOREX_ALLOCATE: 'forex:allocate',
  SUPPLIER_MANAGE: 'supplier:manage',
  
  // Sales permissions
  SALES_READ: 'sales:read',
  SALES_WRITE: 'sales:write',
  ORDER_CREATE: 'order:create',
  ORDER_APPROVE: 'order:approve',
  ORDER_CANCEL: 'order:cancel',
  RETURN_PROCESS: 'return:process',
  
  // Production permissions
  PRODUCTION_READ: 'production:read',
  PRODUCTION_WRITE: 'production:write',
  BOM_MANAGE: 'bom:manage',
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_COMPLETE: 'work_order:complete',
  
  // Reports permissions
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_ADMIN: 'reports:admin',
  
  // Compliance permissions
  COMPLIANCE_READ: 'compliance:read',
  COMPLIANCE_EXPORT: 'compliance:export',
  EUDR_MANAGE: 'eudr:manage',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT_LOGS: 'admin:audit_logs',
  
  // System permissions
  SYSTEM_CONFIG: 'system:config',
  WAREHOUSE_SELECT: 'warehouse:select',
};

// Role to permissions mapping (default roles)
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.QUALITY_WRITE,
    PERMISSIONS.QUALITY_APPROVE,
    PERMISSIONS.QUARANTINE_RELEASE,
    PERMISSIONS.BATCH_RECALL,
    PERMISSIONS.LAB_TEST_CREATE,
    PERMISSIONS.PROCUREMENT_READ,
    PERMISSIONS.PROCUREMENT_WRITE,
    PERMISSIONS.PO_CREATE,
    PERMISSIONS.PO_APPROVE,
    PERMISSIONS.FOREX_ALLOCATE,
    PERMISSIONS.SUPPLIER_MANAGE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.SALES_WRITE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.RETURN_PROCESS,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
    PERMISSIONS.BOM_MANAGE,
    PERMISSIONS.WORK_ORDER_CREATE,
    PERMISSIONS.WORK_ORDER_COMPLETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_ADMIN,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.COMPLIANCE_EXPORT,
    PERMISSIONS.EUDR_MANAGE,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_ROLES,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_AUDIT_LOGS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.WAREHOUSE_SELECT,
  ],
  
  warehouse_manager: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.QUARANTINE_RELEASE,
    PERMISSIONS.PROCUREMENT_READ,
    PERMISSIONS.PO_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.RETURN_PROCESS,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.WAREHOUSE_SELECT,
  ],
  
  quality_officer: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.QUALITY_WRITE,
    PERMISSIONS.QUALITY_APPROVE,
    PERMISSIONS.QUARANTINE_RELEASE,
    PERMISSIONS.BATCH_RECALL,
    PERMISSIONS.LAB_TEST_CREATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.EUDR_MANAGE,
  ],
  
  procurement_manager: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.PROCUREMENT_READ,
    PERMISSIONS.PROCUREMENT_WRITE,
    PERMISSIONS.PO_CREATE,
    PERMISSIONS.PO_APPROVE,
    PERMISSIONS.FOREX_ALLOCATE,
    PERMISSIONS.SUPPLIER_MANAGE,
    PERMISSIONS.REPORTS_READ,
  ],
  
  production_manager: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
    PERMISSIONS.BOM_MANAGE,
    PERMISSIONS.WORK_ORDER_CREATE,
    PERMISSIONS.WORK_ORDER_COMPLETE,
    PERMISSIONS.REPORTS_READ,
  ],
  
  sales_representative: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.SALES_WRITE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.RETURN_PROCESS,
    PERMISSIONS.REPORTS_READ,
  ],
  
  auditor: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.PROCUREMENT_READ,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.ADMIN_AUDIT_LOGS,
  ],
  
  viewer: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.QUALITY_READ,
    PERMISSIONS.PROCUREMENT_READ,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.REPORTS_READ,
  ],
};

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of permission strings from user object
 * @param {string} requiredPermission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 * @param {Array} userPermissions 
 * @param {Array} requiredPermissions 
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions?.length) {
    return false;
  }
  
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
};

/**
 * Check if user has all of the required permissions
 * @param {Array} userPermissions 
 * @param {Array} requiredPermissions 
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions?.length) {
    return false;
  }
  
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
};

/**
 * Get permissions for a role
 * @param {string} roleName 
 * @returns {Array} Array of permissions
 */
export const getRolePermissions = (roleName) => {
  if (!roleName) return [];
  return ROLE_PERMISSIONS[roleName] || [];
};

/**
 * Get all permissions for multiple roles
 * @param {Array} roleNames 
 * @returns {Array} Unique array of all permissions
 */
export const getAllRolePermissions = (roleNames) => {
  if (!roleNames || !Array.isArray(roleNames)) {
    return [];
  }
  
  const allPermissions = new Set();
  
  roleNames.forEach((role) => {
    const perms = getRolePermissions(role);
    perms.forEach((perm) => allPermissions.add(perm));
  });
  
  return Array.from(allPermissions);
};

/**
 * Check if user has a specific role
 * @param {Array} userRoles 
 * @param {string} requiredRole 
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  
  return userRoles.includes(requiredRole);
};

/**
 * Check if user has any of the required roles
 * @param {Array} userRoles 
 * @param {Array} requiredRoles 
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || !requiredRoles?.length) {
    return false;
  }
  
  return requiredRoles.some((role) => userRoles.includes(role));
};

/**
 * Get action label based on permission availability
 * @param {Array} userPermissions 
 * @param {Object} actions - { allowed: 'Label when allowed', denied: 'Label when denied' }
 * @returns {string}
 */
export const getActionLabel = (userPermissions, actions) => {
  const { permission, allowedLabel, deniedLabel } = actions;
  
  if (hasPermission(userPermissions, permission)) {
    return allowedLabel;
  }
  
  return deniedLabel || '';
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items with required permissions
 * @param {Array} userPermissions 
 * @returns {Array} Filtered menu items
 */
export const filterMenuByPermission = (menuItems, userPermissions) => {
  if (!menuItems || !Array.isArray(menuItems)) {
    return [];
  }
  
  return menuItems.filter((item) => {
    if (!item.permission) {
      return true; // No permission requirement means visible to all
    }
    
    if (Array.isArray(item.permission)) {
      return hasAnyPermission(userPermissions, item.permission);
    }
    
    return hasPermission(userPermissions, item.permission);
  });
};

/**
 * Create permission-based action checker
 * @param {Array} userPermissions 
 * @returns {Object} Object with permission check methods
 */
export const createPermissionChecker = (userPermissions) => {
  return {
    can: (permission) => hasPermission(userPermissions, permission),
    canAny: (permissions) => hasAnyPermission(userPermissions, permissions),
    canAll: (permissions) => hasAllPermissions(userPermissions, permissions),
    cannot: (permission) => !hasPermission(userPermissions, permission),
  };
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  getAllRolePermissions,
  hasRole,
  hasAnyRole,
  getActionLabel,
  filterMenuByPermission,
  createPermissionChecker,
};
