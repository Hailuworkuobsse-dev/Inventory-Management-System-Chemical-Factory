import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Package, Plus, Filter, Download } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import StockTable from '../components/StockTable';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';

const StockListPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const stockItems = [
    { id: 1, sku: 'SKU-001', name: 'Widget A', quantity: 150, unit: 'pcs', location: 'A-01-01', status: 'available', expiryDate: '2024-12-31' },
    { id: 2, sku: 'SKU-002', name: 'Widget B', quantity: 75, unit: 'pcs', location: 'A-01-02', status: 'low_stock', expiryDate: '2024-06-30' },
    { id: 3, sku: 'SKU-003', name: 'Component X', quantity: 200, unit: 'kg', location: 'B-02-01', status: 'available', expiryDate: '2025-03-15' },
    { id: 4, sku: 'SKU-004', name: 'Part Y', quantity: 5, unit: 'pcs', location: 'C-03-01', status: 'critical', expiryDate: '2024-02-28' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock List</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor your inventory stock levels
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by SKU or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="sm:w-48">
              <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Locations</option>
                <option value="A">Warehouse A</option>
                <option value="B">Warehouse B</option>
                <option value="C">Warehouse C</option>
              </select>
            </div>

            {/* Filter Button */}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <StockTable items={stockItems} />
      </div>
    </AppLayout>
  );
};

export default StockListPage;
