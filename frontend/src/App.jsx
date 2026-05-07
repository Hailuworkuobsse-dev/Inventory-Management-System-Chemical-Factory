import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';

// Pages (placeholders - will be created in feature modules)
import LoginPage from '@features/auth/pages/LoginPage';
import DashboardPage from '@features/dashboard/pages/DashboardPage';
import UnauthorizedPage from '@features/auth/pages/UnauthorizedPage';

// Route Guards
import ProtectedRoute from '@routes/ProtectedRoute';
import RoleGuard from '@routes/RoleGuard';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          )
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'warehouse_manager']}>
              <DashboardPage />
            </RoleGuard>
          }
        />
        
        {/* Inventory Routes - Placeholder */}
        <Route
          path="inventory/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'warehouse_manager', 'staff']}>
              <div className="p-6">Inventory Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Quality Routes - Placeholder */}
        <Route
          path="quality/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'quality_control']}>
              <div className="p-6">Quality Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Procurement Routes - Placeholder */}
        <Route
          path="procurement/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'procurement_officer']}>
              <div className="p-6">Procurement Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Sales Routes - Placeholder */}
        <Route
          path="sales/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'sales_rep']}>
              <div className="p-6">Sales Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Production Routes - Placeholder */}
        <Route
          path="production/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'production_manager']}>
              <div className="p-6">Production Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Reports Routes - Placeholder */}
        <Route
          path="reports/*"
          element={
            <RoleGuard allowedRoles={['admin', 'manager', 'analyst']}>
              <div className="p-6">Reports Module - Coming Soon</div>
            </RoleGuard>
          }
        />

        {/* Admin Routes - Placeholder */}
        <Route
          path="admin/*"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <div className="p-6">Admin Module - Coming Soon</div>
            </RoleGuard>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
