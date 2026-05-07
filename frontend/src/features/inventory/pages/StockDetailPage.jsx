import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Download, AlertCircle } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import StockDetailCard from '../components/StockDetailCard';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import ExpiryCountdown from '../../../components/ExpiryCountdown';

const StockDetailPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const stockItem = {
    id: parseInt(id),
    sku: 'SKU-001',
    name: 'Widget A Premium',
    description: 'High-quality widget for industrial applications',
    category: 'Components',
    unit: 'pcs',
    quantity: 150,
    minQuantity: 50,
    maxQuantity: 500,
    location: 'A-01-01',
    warehouse: 'Main Warehouse',
    status: 'available',
    expiryDate: '2024-12-31',
    batchNumber: 'BATCH-2024-001',
    supplier: 'ABC Supplies',
    costPrice: 25.50,
    sellingPrice: 45.00,
    totalValue: 3825.00,
    lastUpdated: '2024-01-20T10:30:00Z',
  };

  const stockMovements = [
    { id: 1, type: 'receipt', date: '2024-01-15', quantity: 100, reference: 'GRN-2024-001', user: 'John Doe' },
    { id: 2, type: 'transfer', date: '2024-01-16', quantity: -20, reference: 'TRF-2024-005', user: 'Jane Smith' },
    { id: 3, type: 'adjustment', date: '2024-01-18', quantity: -5, reference: 'ADJ-2024-003', user: 'Admin User' },
    { id: 4, type: 'sale', date: '2024-01-19', quantity: -25, reference: 'ORD-2024-012', user: 'Sales Team' },
  ];

  const columns = [
    { key: 'type', header: 'Type', render: (value) => <StatusBadge status={value} /> },
    { 
      key: 'date', 
      header: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'quantity', 
      header: 'Quantity',
      render: (value) => (
        <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
          {value > 0 ? '+' : ''}{value}
        </span>
      )
    },
    { key: 'reference', header: 'Reference' },
    { key: 'user', header: 'User' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'movements', label: 'Stock Movements' },
    { id: 'batches', label: 'Batch Details' },
    { id: 'alerts', label: 'Alerts' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Inventory', path: '/inventory' },
          { label: 'Stock', path: '/inventory/stock' },
          { label: stockItem.sku }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/inventory/stock')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{stockItem.name}</h1>
              <p className="mt-1 text-sm text-gray-500">SKU: {stockItem.sku}</p>
            </div>
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

        {/* Stock Detail Card */}
        <StockDetailCard item={stockItem} />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm mr-8
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <p className="text-lg font-semibold text-gray-900">{stockItem.location}</p>
                  <p className="text-sm text-gray-500">{stockItem.warehouse}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Stock Level</h3>
                  <p className="text-lg font-semibold text-gray-900">{stockItem.quantity} {stockItem.unit}</p>
                  <p className="text-sm text-gray-500">Min: {stockItem.minQuantity} | Max: {stockItem.maxQuantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Value</h3>
                  <p className="text-lg font-semibold text-gray-900">${stockItem.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Cost: ${stockItem.costPrice} | Sell: ${stockItem.sellingPrice}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier</h3>
                  <p className="text-lg font-semibold text-gray-900">{stockItem.supplier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Date</h3>
                  <p className="text-lg font-semibold text-gray-900">{new Date(stockItem.expiryDate).toLocaleDateString()}</p>
                  <ExpiryCountdown expiryDate={stockItem.expiryDate} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                  <p className="text-lg font-semibold text-gray-900">{new Date(stockItem.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            )}

            {activeTab === 'movements' && (
              <DataTable 
                columns={columns}
                data={stockMovements}
                emptyMessage="No stock movements found"
              />
            )}

            {activeTab === 'batches' && (
              <div className="text-center py-12 text-gray-500">
                Batch details coming soon...
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Low Stock Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Current stock is approaching minimum threshold (50 units). Consider reordering.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StockDetailPage;
