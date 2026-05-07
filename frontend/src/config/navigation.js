// Navigation Configuration
import { PERMISSIONS } from './permissions';

export const navigationConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'Home',
    permission: null, // Available to all authenticated users
    children: [],
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    permission: PERMISSIONS.INVENTORY_VIEW,
    children: [
      {
        title: 'Stock List',
        path: '/inventory/stock',
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        title: 'Receipts',
        path: '/inventory/receipts',
        permission: PERMISSIONS.INVENTORY_RECEIVE,
      },
      {
        title: 'Transfers',
        path: '/inventory/transfers',
        permission: PERMISSIONS.INVENTORY_TRANSFER,
      },
      {
        title: 'Adjustments',
        path: '/inventory/adjustments',
        permission: PERMISSIONS.INVENTORY_ADJUST,
      },
    ],
  },
  {
    title: 'Quality',
    path: '/quality',
    icon: 'ClipboardCheck',
    permission: PERMISSIONS.QUALITY_VIEW,
    children: [
      {
        title: 'Batches',
        path: '/quality/batches',
        permission: PERMISSIONS.QUALITY_VIEW,
      },
      {
        title: 'Lab Tests',
        path: '/quality/lab-tests',
        permission: PERMISSIONS.QUALITY_LAB_TEST,
      },
      {
        title: 'Recalls',
        path: '/quality/recalls',
        permission: PERMISSIONS.QUALITY_RECALL,
      },
      {
        title: 'EUDR Compliance',
        path: '/quality/eudr',
        permission: PERMISSIONS.COMPLIANCE_EUDR,
      },
    ],
  },
  {
    title: 'Procurement',
    path: '/procurement',
    icon: 'ShoppingCart',
    permission: PERMISSIONS.PROCUREMENT_VIEW,
    children: [
      {
        title: 'Suppliers',
        path: '/procurement/suppliers',
        permission: PERMISSIONS.PROCUREMENT_MANAGE_SUPPLIERS,
      },
      {
        title: 'Purchase Orders',
        path: '/procurement/purchase-orders',
        permission: PERMISSIONS.PROCUREMENT_VIEW,
      },
      {
        title: 'Forex Allocation',
        path: '/procurement/forex',
        permission: PERMISSIONS.PROCUREMENT_CREATE,
      },
    ],
  },
  {
    title: 'Sales',
    path: '/sales',
    icon: 'DollarSign',
    permission: PERMISSIONS.SALES_VIEW,
    children: [
      {
        title: 'Orders',
        path: '/sales/orders',
        permission: PERMISSIONS.SALES_VIEW,
      },
      {
        title: 'Returns',
        path: '/sales/returns',
        permission: PERMISSIONS.SALES_PROCESS_RETURN,
      },
    ],
  },
  {
    title: 'Production',
    path: '/production',
    icon: 'Factory',
    permission: PERMISSIONS.PRODUCTION_VIEW,
    children: [
      {
        title: 'BOMs',
        path: '/production/boms',
        permission: PERMISSIONS.PRODUCTION_VIEW,
      },
      {
        title: 'Work Orders',
        path: '/production/work-orders',
        permission: PERMISSIONS.PRODUCTION_VIEW,
      },
    ],
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: 'BarChart2',
    permission: PERMISSIONS.REPORTS_VIEW,
    children: [
      {
        title: 'Inventory Turnover',
        path: '/reports/inventory-turnover',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: 'ABC Analysis',
        path: '/reports/abc-analysis',
        permission: PERMISSIONS.REPORTS_ANALYTICS,
      },
      {
        title: 'Slow Movers',
        path: '/reports/slow-movers',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: 'Expiry Risk',
        path: '/reports/expiry-risk',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: 'Stock-Out Risk',
        path: '/reports/stock-out-risk',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: 'Demand Forecast',
        path: '/reports/demand-forecast',
        permission: PERMISSIONS.REPORTS_ANALYTICS,
      },
    ],
  },
  {
    title: 'IoT Monitoring',
    path: '/iot',
    icon: 'Wifi',
    permission: PERMISSIONS.IOT_VIEW,
    children: [],
  },
  {
    title: 'Compliance',
    path: '/compliance',
    icon: 'FileText',
    permission: PERMISSIONS.COMPLIANCE_VIEW,
    children: [
      {
        title: 'eRIS Export',
        path: '/compliance/eris',
        permission: PERMISSIONS.COMPLIANCE_EXPORT_ERIS,
      },
      {
        title: 'Tax Export',
        path: '/compliance/tax',
        permission: PERMISSIONS.COMPLIANCE_EXPORT_TAX,
      },
      {
        title: 'Audit Logs',
        path: '/compliance/audit-logs',
        permission: PERMISSIONS.ADMIN_AUDIT_LOGS,
      },
    ],
  },
  {
    title: 'Administration',
    path: '/admin',
    icon: 'Settings',
    permission: PERMISSIONS.ADMIN_USERS,
    children: [
      {
        title: 'User Management',
        path: '/admin/users',
        permission: PERMISSIONS.ADMIN_USERS,
      },
      {
        title: 'Role Management',
        path: '/admin/roles',
        permission: PERMISSIONS.ADMIN_ROLES,
      },
      {
        title: 'System Settings',
        path: '/admin/settings',
        permission: PERMISSIONS.ADMIN_SETTINGS,
      },
    ],
  },
];

/**
 * Filter navigation items based on user permissions
 * @param {Array} userPermissions - Array of permission strings for the user
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByPermission = (userPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return [];
  }

  const hasAccess = (permission) => {
    if (!permission) return true;
    return userPermissions.includes(permission);
  };

  const filterItems = (items) => {
    return items
      .filter(item => hasAccess(item.permission))
      .map(item => ({
        ...item,
        children: item.children && item.children.length > 0
          ? filterItems(item.children)
          : [],
      }))
      .filter(item => item.children.length > 0 || hasAccess(item.permission));
  };

  return filterItems(navigationConfig);
};

/**
 * Check if a path is accessible based on user permissions
 * @param {string} path - The path to check
 * @param {Array} userPermissions - Array of permission strings for the user
 * @returns {boolean}
 */
export const isPathAccessible = (path, userPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  const findPathInNav = (items, targetPath) => {
    for (const item of items) {
      if (item.path === targetPath) {
        return item.permission === null || userPermissions.includes(item.permission);
      }
      if (item.children && item.children.length > 0) {
        const found = findPathInNav(item.children, targetPath);
        if (found !== null) return found;
      }
    }
    return null;
  };

  const result = findPathInNav(navigationConfig, path);
  return result !== false;
};
