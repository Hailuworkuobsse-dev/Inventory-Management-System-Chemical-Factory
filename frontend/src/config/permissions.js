// Permission Definitions and Role-Based Access Control Configuration

export const PERMISSIONS = {
  // Inventory Permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_EDIT: 'inventory:edit',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_RECEIVE: 'inventory:receive',
  
  // Quality Permissions
  QUALITY_VIEW: 'quality:view',
  QUALITY_CREATE: 'quality:create',
  QUALITY_EDIT: 'quality:edit',
  QUALITY_DELETE: 'quality:delete',
  QUALITY_APPROVE: 'quality:approve',
  QUALITY_REJECT: 'quality:reject',
  QUALITY_QUARANTINE: 'quality:quarantine',
  QUALITY_RELEASE: 'quality:release',
  QUALITY_LAB_TEST: 'quality:lab_test',
  QUALITY_RECALL: 'quality:recall',
  
  // Procurement Permissions
  PROCUREMENT_VIEW: 'procurement:view',
  PROCUREMENT_CREATE: 'procurement:create',
  PROCUREMENT_EDIT: 'procurement:edit',
  PROCUREMENT_DELETE: 'procurement:delete',
  PROCUREMENT_APPROVE_PO: 'procurement:approve_po',
  PROCUREMENT_MANAGE_SUPPLIERS: 'procurement:manage_suppliers',
  
  // Sales Permissions
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_EDIT: 'sales:edit',
  SALES_DELETE: 'sales:delete',
  SALES_APPROVE_ORDER: 'sales:approve_order',
  SALES_PROCESS_RETURN: 'sales:process_return',
  
  // Production Permissions
  PRODUCTION_VIEW: 'production:view',
  PRODUCTION_CREATE: 'production:create',
  PRODUCTION_EDIT: 'production:edit',
  PRODUCTION_DELETE: 'production:delete',
  PRODUCTION_START_WO: 'production:start_wo',
  PRODUCTION_COMPLETE_WO: 'production:complete_wo',
  
  // Reports Permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_ANALYTICS: 'reports:analytics',
  
  // Admin Permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT_LOGS: 'admin:audit_logs',
  
  // Compliance Permissions
  COMPLIANCE_VIEW: 'compliance:view',
  COMPLIANCE_EXPORT_ERIS: 'compliance:export_eris',
  COMPLIANCE_EXPORT_TAX: 'compliance:export_tax',
  COMPLIANCE_EUDR: 'compliance:eudr',
  
  // IoT Permissions
  IOT_VIEW: 'iot:view',
  IOT_MANAGE_SENSORS: 'iot:manage_sensors',
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  QUALITY_MANAGER: 'quality_manager',
  PROCUREMENT_OFFICER: 'procurement_officer',
  SALES_OFFICER: 'sales_officer',
  PRODUCTION_MANAGER: 'production_manager',
  INVENTORY_CLERK: 'inventory_clerk',
  QUALITY_INSPECTOR: 'quality_inspector',
  VIEWER: 'viewer',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.ADMIN]: [
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_CREATE, PERMISSIONS.QUALITY_EDIT,
    PERMISSIONS.PROCUREMENT_VIEW, PERMISSIONS.PROCUREMENT_CREATE, PERMISSIONS.PROCUREMENT_EDIT,
    PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_EDIT,
    PERMISSIONS.PRODUCTION_VIEW, PERMISSIONS.PRODUCTION_CREATE, PERMISSIONS.PRODUCTION_EDIT,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT, PERMISSIONS.REPORTS_ANALYTICS,
    PERMISSIONS.ADMIN_USERS, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.ADMIN_SETTINGS, PERMISSIONS.ADMIN_AUDIT_LOGS,
    PERMISSIONS.COMPLIANCE_VIEW, PERMISSIONS.COMPLIANCE_EXPORT_ERIS, PERMISSIONS.COMPLIANCE_EXPORT_TAX,
    PERMISSIONS.IOT_VIEW,
  ],
  
  [ROLES.WAREHOUSE_MANAGER]: [
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.INVENTORY_TRANSFER, PERMISSIONS.INVENTORY_RECEIVE,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
  ],
  
  [ROLES.QUALITY_MANAGER]: [
    PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_CREATE, PERMISSIONS.QUALITY_EDIT,
    PERMISSIONS.QUALITY_APPROVE, PERMISSIONS.QUALITY_REJECT, PERMISSIONS.QUALITY_QUARANTINE,
    PERMISSIONS.QUALITY_RELEASE, PERMISSIONS.QUALITY_LAB_TEST, PERMISSIONS.QUALITY_RECALL,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.COMPLIANCE_VIEW, PERMISSIONS.COMPLIANCE_EUDR,
  ],
  
  [ROLES.PROCUREMENT_OFFICER]: [
    PERMISSIONS.PROCUREMENT_VIEW, PERMISSIONS.PROCUREMENT_CREATE, PERMISSIONS.PROCUREMENT_EDIT,
    PERMISSIONS.PROCUREMENT_MANAGE_SUPPLIERS,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  [ROLES.SALES_OFFICER]: [
    PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_PROCESS_RETURN,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  [ROLES.PRODUCTION_MANAGER]: [
    PERMISSIONS.PRODUCTION_VIEW, PERMISSIONS.PRODUCTION_CREATE, PERMISSIONS.PRODUCTION_EDIT,
    PERMISSIONS.PRODUCTION_START_WO, PERMISSIONS.PRODUCTION_COMPLETE_WO,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  [ROLES.INVENTORY_CLERK]: [
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_RECEIVE, PERMISSIONS.INVENTORY_TRANSFER,
  ],
  
  [ROLES.QUALITY_INSPECTOR]: [
    PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_CREATE, PERMISSIONS.QUALITY_LAB_TEST,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.QUALITY_VIEW, PERMISSIONS.REPORTS_VIEW,
  ],
};

/**
 * Check if a user has a specific permission
 * @param {Array} userPermissions - Array of permission strings for the user
 * @param {string} requiredPermission - The permission to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if a user has any of the specified permissions
 * @param {Array} userPermissions - Array of permission strings for the user
 * @param {Array} requiredPermissions - Array of required permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param {Array} userPermissions - Array of permission strings for the user
 * @param {Array} requiredPermissions - Array of required permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - The role to get permissions for
 * @returns {Array}
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};
