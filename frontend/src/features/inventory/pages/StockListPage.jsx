import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import StockTable from '../components/StockTable';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { useGetStockQuery } from '../../../services/inventoryEndpoints';

const StockListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading, isError, refetch } = useGetStockQuery();

  if (isError) {
    toast.error('Failed to load stock levels');
  }

  const raw = Array.isArray(response) ? response : response?.data || [];
  const stockItems = raw.map((row) => ({
    id: row.id,
    sku: row.product?.sku || row.sku,
    name: row.product?.name || row.name,
    quantity: row.quantity,
    unit: row.unit || row.product?.unit || 'pcs',
    location: row.location || row.binLocation || row.warehouse?.name || '-',
    status: row.status || (row.quantity <= 0 ? 'critical' : 'available'),
    expiryDate: row.expiryDate || row.batch?.expiryDate || null,
  }));

  const filtered = stockItems.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
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
            <button
              onClick={() => navigate('/inventory/receipts/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-10 flex justify-center"><LoadingSpinner /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No stock found"
              message="Try adjusting filters or check back once receipts are received."
              onRetry={() => refetch()}
            />
          ) : (
            <StockTable items={filtered} />
          )}
        </div>
      </div>
    </>
  );
};

export default StockListPage;
