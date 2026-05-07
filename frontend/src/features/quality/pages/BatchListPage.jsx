import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Filter, Download, Search } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import Breadcrumb from '../../../components/Breadcrumb';

const BatchListPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const batches = [
    { id: 1, batchNumber: 'BATCH-2024-001', product: 'Widget A', quantity: 500, status: 'released', manufactureDate: '2024-01-10', expiryDate: '2025-01-10' },
    { id: 2, batchNumber: 'BATCH-2024-002', product: 'Widget B', quantity: 300, status: 'quarantine', manufactureDate: '2024-01-15', expiryDate: '2025-01-15' },
    { id: 3, batchNumber: 'BATCH-2024-003', product: 'Component X', quantity: 1000, status: 'pending', manufactureDate: '2024-01-18', expiryDate: '2025-01-18' },
    { id: 4, batchNumber: 'BATCH-2024-004', product: 'Part Y', quantity: 200, status: 'rejected', manufactureDate: '2024-01-20', expiryDate: '2025-01-20' },
  ];

  const columns = [
    { key: 'batchNumber', header: 'Batch Number', render: (value) => <span className="font-medium">{value}</span> },
    { key: 'product', header: 'Product' },
    { 
      key: 'quantity', 
      header: 'Quantity',
      render: (value, row) => `${value} ${row.unit || 'pcs'}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { 
      key: 'manufactureDate', 
      header: 'Manufacture Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'expiryDate', 
      header: 'Expiry Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage production batches
            </p>
          </div>
          <button 
            onClick={() => navigate('/quality/batches/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Batch
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="quarantine">Quarantine</option>
              <option value="released">Released</option>
              <option value="rejected">Rejected</option>
            </select>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Batches Table */}
        <DataTable 
          columns={columns}
          data={batches}
          onRowClick={(row) => navigate(`/quality/batches/${row.id}`)}
          emptyMessage="No batches found"
        />
      </div>
    </AppLayout>
  );
};

export default BatchListPage;
