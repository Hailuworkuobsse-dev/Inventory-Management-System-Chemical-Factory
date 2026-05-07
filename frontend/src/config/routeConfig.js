/**
 * Route configuration for the application
 */

export const routes = {
  // Public routes
  public: [
    {
      path: '/login',
      name: 'Login',
      component: 'LoginPage',
      exact: true,
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: 'ForgotPasswordPage',
      exact: true,
    },
  ],

  // Protected routes
  protected: [
    {
      path: '/',
      name: 'Dashboard',
      component: 'DashboardPage',
      exact: true,
      permission: 'view_dashboard',
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: 'InventoryPage',
      exact: true,
      permission: 'view_inventory',
    },
    {
      path: '/inventory/:id',
      name: 'InventoryDetail',
      component: 'InventoryDetailPage',
      exact: true,
      permission: 'view_inventory',
    },
    {
      path: '/products',
      name: 'Products',
      component: 'ProductsPage',
      exact: true,
      permission: 'view_products',
    },
    {
      path: '/products/:id',
      name: 'ProductDetail',
      component: 'ProductDetailPage',
      exact: true,
      permission: 'view_products',
    },
    {
      path: '/sales',
      name: 'Sales',
      component: 'SalesPage',
      exact: true,
      permission: 'view_sales',
    },
    {
      path: '/sales/new',
      name: 'NewSale',
      component: 'NewSalePage',
      exact: true,
      permission: 'create_sales',
    },
    {
      path: '/sales/:id',
      name: 'SaleDetail',
      component: 'SaleDetailPage',
      exact: true,
      permission: 'view_sales',
    },
    {
      path: '/purchases',
      name: 'Purchases',
      component: 'PurchasesPage',
      exact: true,
      permission: 'view_purchases',
    },
    {
      path: '/purchases/new',
      name: 'NewPurchase',
      component: 'NewPurchasePage',
      exact: true,
      permission: 'create_purchases',
    },
    {
      path: '/suppliers',
      name: 'Suppliers',
      component: 'SuppliersPage',
      exact: true,
      permission: 'view_suppliers',
    },
    {
      path: '/customers',
      name: 'Customers',
      component: 'CustomersPage',
      exact: true,
      permission: 'view_customers',
    },
    {
      path: '/quality',
      name: 'QualityControl',
      component: 'QualityControlPage',
      exact: true,
      permission: 'view_quality',
    },
    {
      path: '/reports',
      name: 'Reports',
      component: 'ReportsPage',
      exact: true,
      permission: 'view_reports',
    },
    {
      path: '/reports/expiry-risk',
      name: 'ExpiryRiskReport',
      component: 'ExpiryRiskPage',
      exact: true,
      permission: 'view_reports',
    },
    {
      path: '/reports/stock-out-risk',
      name: 'StockOutRiskReport',
      component: 'StockOutRiskPage',
      exact: true,
      permission: 'view_reports',
    },
    {
      path: '/reports/demand-forecast',
      name: 'DemandForecastReport',
      component: 'DemandForecastPage',
      exact: true,
      permission: 'view_reports',
    },
    {
      path: '/settings',
      name: 'Settings',
      component: 'SettingsPage',
      exact: true,
      permission: 'manage_settings',
    },
    {
      path: '/users',
      name: 'Users',
      component: 'UsersPage',
      exact: true,
      permission: 'manage_users',
    },
    {
      path: '/roles',
      name: 'Roles',
      component: 'RolesPage',
      exact: true,
      permission: 'manage_roles',
    },
  ],

  // Error routes
  error: [
    {
      path: '/404',
      name: 'NotFound',
      component: 'NotFoundPage',
      exact: true,
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: 'ForbiddenPage',
      exact: true,
    },
    {
      path: '/500',
      name: 'ServerError',
      component: 'ServerErrorPage',
      exact: true,
    },
  ],
};

export const getDefaultRoute = (role) => {
  return '/';
};

export const getRouteByPath = (path) => {
  const allRoutes = [...routes.public, ...routes.protected, ...routes.error];
  return allRoutes.find((route) => route.path === path);
};

export const getRoutesByPermission = (permissions) => {
  return routes.protected.filter((route) => {
    if (!route.permission) return true;
    return permissions.includes(route.permission);
  });
};

export default routes;
