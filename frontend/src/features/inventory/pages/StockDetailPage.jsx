import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, AlertCircle, Edit, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import StockDetailCard from '../components/StockDetailCard';
import StatusBadge from '../../../components/StatusBadge';
import ExpiryCountdown from '../../../components/ExpiryCountdown';

const StockDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const stockItem = {
    id: parseInt(id),
    sku: 'SKU-001',
    name: 'Widget A',
    description: 'High-quality widget for industrial applications',
    quantity: 150,
    unit: 'pcs',
    location: 'A-01-01',
    warehouse: 'Main Warehouse',
    status: 'available',
    expiryDate: '2024-12-31',
    manufactureDate: '2023-01-15',
    batchNumber: 'BATCH-2023-001',
    supplier: 'ABC Suppliers Ltd',
    costPrice: 25.50,
    sellingPrice: 45.00,
    totalValue: 3825.00,
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderPoint: 75,
  };

  const batches = [
    { id: 1, batchNumber: 'BATCH-2023-001', quantity: 100, expiryDate: '2024-12-31', status: 'released' },
    { id: 2, batchNumber: 'BATCH-2023-002', quantity: 50, expiryDate: '2025-01-15', status: 'released' },
  ];

  const movements = [
    { id: 1, type: 'receipt', date: '2024-01-15', quantity: 50, reference: 'GRN-2024-001', user: 'John Doe' },
    { id: 2, type: 'sale', date: '2024-01-10', quantity: -25, reference: 'SO-2024-045', user: 'Jane Smith' },
    { id: 3, type: 'adjustment', date: '2024-01-05', quantity: -5, reference: 'ADJ-2024-008', user: 'Mike Johnson' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/inventory/stock"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{stockItem.name}</h1>
              <p className="text-sm text-gray-500">{stockItem.sku}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <History className="h-4 w-4 mr-2" />
              View History
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <StockDetailCard title="Basic Information">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{stockItem.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{stockItem.batchNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                  <dd className="mt-1 text-sm text-gray-900">{stockItem.supplier}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge color="green" text="Available" />
                  </dd>
                </div>
              </dl>
            </StockDetailCard>

            {/* Stock Levels Card */}
            <StockDetailCard title="Stock Levels">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Stock</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stockItem.quantity} {stockItem.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${(stockItem.quantity / stockItem.maxStockLevel) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <dt className="text-xs text-gray-500">Min Level</dt>
                    <dd className="text-sm font-medium text-gray-900">{stockItem.minStockLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Reorder Point</dt>
                    <dd className="text-sm font-medium text-gray-900">{stockItem.reorderPoint}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Max Level</dt>
                    <dd className="text-sm font-medium text-gray-900">{stockItem.maxStockLevel}</dd>
                  </div>
                </div>
              </div>
            </StockDetailCard>

            {/* Recent Movements */}
            <StockDetailCard title="Recent Movements">
              <div className="flow-root">
                <ul className="-mb-8">
                  {movements.map((movement, idx) => (
                    <li key={movement.id}>
                      <div className="relative pb-8">
                        {idx !== movements.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            movement.type === 'receipt' ? 'bg-green-500' :
                            movement.type === 'sale' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {movement.type} by <span className="font-medium text-gray-900">{movement.user}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <span className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                              </span>
                              <time dateTime={movement.date} className="ml-2">
                                {movement.date}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </StockDetailCard>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Location Card */}
            <StockDetailCard title="Location">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{stockItem.location}</p>
                  <p className="text-xs text-gray-500">{stockItem.warehouse}</p>
                </div>
              </div>
            </StockDetailCard>

            {/* Expiry Info */}
            <StockDetailCard title="Expiry Information">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Expiry Date</span>
                  <ExpiryCountdown expiryDate={stockItem.expiryDate} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Manufacture Date</span>
                  <span className="text-sm text-gray-900">{stockItem.manufactureDate}</span>
                </div>
              </div>
            </StockDetailCard>

            {/* Financial Info */}
            <StockDetailCard title="Financial Information">
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cost Price</span>
                  <span className="text-sm font-medium text-gray-900">${stockItem.costPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Selling Price</span>
                  <span className="text-sm font-medium text-gray-900">${stockItem.sellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="text-lg font-semibold text-green-600">${stockItem.totalValue.toFixed(2)}</span>
                </div>
              </dl>
            </StockDetailCard>

            {/* Batches */}
            <StockDetailCard title="Batches">
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{batch.batchNumber}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{batch.quantity} {stockItem.unit}</span>
                      <StatusBadge color="green" text={batch.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            </StockDetailCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StockDetailPage;
