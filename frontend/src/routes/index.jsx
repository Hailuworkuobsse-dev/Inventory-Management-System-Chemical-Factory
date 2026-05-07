import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import EmptyLayout from './layouts/EmptyLayout';

// Auth Pages
import LoginPage from './features/auth/pages/LoginPage';
import UnauthorizedPage from './features/auth/pages/UnauthorizedPage';

// Dashboard
import DashboardPage from './features/dashboard/pages/DashboardPage';

// Inventory Pages
import StockListPage from './features/inventory/pages/StockListPage';
import StockDetailPage from './features/inventory/pages/StockDetailPage';
import ReceiptListPage from './features/inventory/pages/ReceiptListPage';
import ReceiptCreatePage from './features/inventory/pages/ReceiptCreatePage';
import TransferPage from './features/inventory/pages/TransferPage';
import AdjustmentPage from './features/inventory/pages/AdjustmentPage';

// Quality Pages
import BatchListPage from './features/quality/pages/BatchListPage';
import BatchDetailPage from './features/quality/pages/BatchDetailPage';
import LabTestPage from './features/quality/pages/LabTestPage';
import RecallPage from './features/quality/pages/RecallPage';
import EudrPage from './features/quality/pages/EudrPage';

// Procurement Pages
import SupplierListPage from './features/procurement/pages/SupplierListPage';
import SupplierDetailPage from './features/procurement/pages/SupplierDetailPage';
import PurchaseOrderListPage from './features/procurement/pages/PurchaseOrderListPage';
import PurchaseOrderCreatePage from './features/procurement/pages/PurchaseOrderCreatePage';
import ForexPage from './features/procurement/pages/ForexPage';

// Sales Pages
import OrderListPage from './features/sales/pages/OrderListPage';
import OrderCreatePage from './features/sales/pages/OrderCreatePage';
import OrderDetailPage from './features/sales/pages/OrderDetailPage';
import ReturnListPage from './features/sales/pages/ReturnListPage';
import CustomerPortalPage from './features/sales/pages/CustomerPortalPage';

// Production Pages
import BomListPage from './features/production/pages/BomListPage';
import BomCreatePage from './features/production/pages/BomCreatePage';
import WorkOrderListPage from './features/production/pages/WorkOrderListPage';
import WorkOrderDetailPage from './features/production/pages/WorkOrderDetailPage';

// Reports Pages
import InventoryTurnoverPage from './features/reports/pages/InventoryTurnoverPage';
import AbcAnalysisPage from './features/reports/pages/AbcAnalysisPage';
import SlowMoversPage from './features/reports/pages/SlowMoversPage';
import ExpiryRiskPage from './features/reports/pages/ExpiryRiskPage';
import StockOutRiskPage from './features/reports/pages/StockOutRiskPage';
import DemandForecastPage from './features/reports/pages/DemandForecastPage';

// Compliance Pages
import ErisExportPage from './features/compliance/pages/ErisExportPage';
import TaxExportPage from './features/compliance/pages/TaxExportPage';
import AuditReportPage from './features/compliance/pages/AuditReportPage';

// IoT Pages
import IotDashboardPage from './features/iot/pages/IotDashboardPage';

// Admin Pages
import UserManagementPage from './features/admin/pages/UserManagementPage';
import RoleManagementPage from './features/admin/pages/RoleManagementPage';
import SystemSettingsPage from './features/admin/pages/SystemSettingsPage';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />
        
        <Route path="/unauthorized" element={
          <EmptyLayout>
            <UnauthorizedPage />
          </EmptyLayout>
        } />

        {/* Protected Routes with AppLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredPermissions={['reports:view']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Inventory */}
          <Route path="inventory">
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={
              <ProtectedRoute requiredPermissions={['inventory:view']}>
                <StockListPage />
              </ProtectedRoute>
            } />
            <Route path="stock/:id" element={
              <ProtectedRoute requiredPermissions={['inventory:view']}>
                <StockDetailPage />
              </ProtectedRoute>
            } />
            <Route path="receipts" element={
              <ProtectedRoute requiredPermissions={['inventory:receipt']}>
                <ReceiptListPage />
              </ProtectedRoute>
            } />
            <Route path="receipts/create" element={
              <ProtectedRoute requiredPermissions={['inventory:receipt']}>
                <ReceiptCreatePage />
              </ProtectedRoute>
            } />
            <Route path="transfers" element={
              <ProtectedRoute requiredPermissions={['inventory:transfer']}>
                <TransferPage />
              </ProtectedRoute>
            } />
            <Route path="adjustments" element={
              <ProtectedRoute requiredPermissions={['inventory:adjust']}>
                <AdjustmentPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Quality */}
          <Route path="quality">
            <Route index element={<Navigate to="batches" replace />} />
            <Route path="batches" element={
              <ProtectedRoute requiredPermissions={['quality:view']}>
                <BatchListPage />
              </ProtectedRoute>
            } />
            <Route path="batches/:id" element={
              <ProtectedRoute requiredPermissions={['quality:view']}>
                <BatchDetailPage />
              </ProtectedRoute>
            } />
            <Route path="lab-tests" element={
              <ProtectedRoute requiredPermissions={['quality:create']}>
                <LabTestPage />
              </ProtectedRoute>
            } />
            <Route path="recalls" element={
              <ProtectedRoute requiredPermissions={['quality:recall']}>
                <RecallPage />
              </ProtectedRoute>
            } />
            <Route path="eudr" element={
              <ProtectedRoute requiredPermissions={['quality:certificate']}>
                <EudrPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Procurement */}
          <Route path="procurement">
            <Route index element={<Navigate to="suppliers" replace />} />
            <Route path="suppliers" element={
              <ProtectedRoute requiredPermissions={['procurement:view']}>
                <SupplierListPage />
              </ProtectedRoute>
            } />
            <Route path="suppliers/:id" element={
              <ProtectedRoute requiredPermissions={['procurement:view']}>
                <SupplierDetailPage />
              </ProtectedRoute>
            } />
            <Route path="purchase-orders" element={
              <ProtectedRoute requiredPermissions={['procurement:view']}>
                <PurchaseOrderListPage />
              </ProtectedRoute>
            } />
            <Route path="purchase-orders/create" element={
              <ProtectedRoute requiredPermissions={['procurement:create']}>
                <PurchaseOrderCreatePage />
              </ProtectedRoute>
            } />
            <Route path="forex" element={
              <ProtectedRoute requiredPermissions={['procurement:forex']}>
                <ForexPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Sales */}
          <Route path="sales">
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={
              <ProtectedRoute requiredPermissions={['sales:view']}>
                <OrderListPage />
              </ProtectedRoute>
            } />
            <Route path="orders/create" element={
              <ProtectedRoute requiredPermissions={['sales:create']}>
                <OrderCreatePage />
              </ProtectedRoute>
            } />
            <Route path="orders/:id" element={
              <ProtectedRoute requiredPermissions={['sales:view']}>
                <OrderDetailPage />
              </ProtectedRoute>
            } />
            <Route path="returns" element={
              <ProtectedRoute requiredPermissions={['sales:return']}>
                <ReturnListPage />
              </ProtectedRoute>
            } />
            <Route path="customer-portal" element={
              <ProtectedRoute requiredPermissions={['sales:view']}>
                <CustomerPortalPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Production */}
          <Route path="production">
            <Route index element={<Navigate to="work-orders" replace />} />
            <Route path="boms" element={
              <ProtectedRoute requiredPermissions={['production:bom']}>
                <BomListPage />
              </ProtectedRoute>
            } />
            <Route path="boms/create" element={
              <ProtectedRoute requiredPermissions={['production:bom']}>
                <BomCreatePage />
              </ProtectedRoute>
            } />
            <Route path="work-orders" element={
              <ProtectedRoute requiredPermissions={['production:view']}>
                <WorkOrderListPage />
              </ProtectedRoute>
            } />
            <Route path="work-orders/:id" element={
              <ProtectedRoute requiredPermissions={['production:view']}>
                <WorkOrderDetailPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Reports */}
          <Route path="reports">
            <Route index element={<Navigate to="inventory-turnover" replace />} />
            <Route path="inventory-turnover" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <InventoryTurnoverPage />
              </ProtectedRoute>
            } />
            <Route path="abc-analysis" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <AbcAnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="slow-movers" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <SlowMoversPage />
              </ProtectedRoute>
            } />
            <Route path="expiry-risk" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <ExpiryRiskPage />
              </ProtectedRoute>
            } />
            <Route path="stockout-risk" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <StockOutRiskPage />
              </ProtectedRoute>
            } />
            <Route path="demand-forecast" element={
              <ProtectedRoute requiredPermissions={['reports:view']}>
                <DemandForecastPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Compliance */}
          <Route path="compliance">
            <Route index element={<Navigate to="audit-report" replace />} />
            <Route path="eris-export" element={
              <ProtectedRoute requiredPermissions={['admin:audit']}>
                <ErisExportPage />
              </ProtectedRoute>
            } />
            <Route path="tax-export" element={
              <ProtectedRoute requiredPermissions={['admin:audit']}>
                <TaxExportPage />
              </ProtectedRoute>
            } />
            <Route path="audit-report" element={
              <ProtectedRoute requiredPermissions={['admin:audit']}>
                <AuditReportPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* IoT */}
          <Route path="iot" element={
            <ProtectedRoute requiredPermissions={['iot:view']}>
              <IotDashboardPage />
            </ProtectedRoute>
          } />

          {/* Admin - Role protected */}
          <Route path="admin" element={
            <RoleGuard allowedRoles={['admin']}>
              <Outlet />
            </RoleGuard>
          }>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="roles" element={<RoleManagementPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
