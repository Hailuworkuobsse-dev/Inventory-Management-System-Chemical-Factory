import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import DashboardGrid from '../components/DashboardGrid';
import StockValueCard from '../components/widgets/StockValueCard';
import StockOutRiskList from '../components/widgets/StockOutRiskList';
import ExpiryTimelineChart from '../components/widgets/ExpiryTimelineChart';
import RecentTransactions from '../components/widgets/RecentTransactions';

const DashboardPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your inventory.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StockValueCard 
            title="Total Stock Value" 
            value="$125,430" 
            change="+12.5%" 
            trend="up" 
          />
          <StockValueCard 
            title="Items in Stock" 
            value="1,234" 
            change="+3.2%" 
            trend="up" 
          />
          <StockValueCard 
            title="Low Stock Items" 
            value="23" 
            change="-5.1%" 
            trend="down" 
            alert
          />
          <StockValueCard 
            title="Expiring Soon" 
            value="12" 
            change="+2" 
            trend="up" 
            alert
          />
        </div>

        {/* Main Dashboard Grid */}
        <DashboardGrid>
          {/* Stock Out Risk - Top Left */}
          <div className="lg:col-span-2">
            <StockOutRiskList />
          </div>

          {/* Expiry Timeline - Top Right */}
          <div className="lg:col-span-1">
            <ExpiryTimelineChart />
          </div>

          {/* Recent Transactions - Full Width Bottom */}
          <div className="lg:col-span-3">
            <RecentTransactions />
          </div>
        </DashboardGrid>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
