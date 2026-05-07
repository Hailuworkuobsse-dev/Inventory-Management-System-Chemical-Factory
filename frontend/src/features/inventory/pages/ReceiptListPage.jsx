import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Download } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import ReceiptForm from '../components/ReceiptForm';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import Breadcrumb from '../../../components/Breadcrumb';

const ReceiptListPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const receipts = [
    { id: 1, receiptNumber: 'GRN-2024-001', supplier: 'ABC Supplies', date: '2024-01-15', status: 'completed', items: 15, totalValue: 5000 },
    { id: 2, receiptNumber: 'GRN-2024-002', supplier: 'XYZ Materials', date: '2024-01-18', status: 'pending', items: 8, totalValue: 3200 },
    { id: 3, receiptNumber: 'GRN-2024-003', supplier: 'Global Parts', date: '2024-01-20', status: 'partial', items: 20, totalValue: 8500 },
    { id: 4, receiptNumber: 'GRN-2024-004', supplier: 'ABC Supplies', date: '2024-01-22', status: 'completed', items: 5, totalValue: 1500 },
  ];

  const columns = [
    { key: 'receiptNumber', header: 'Receipt Number' },
    { 
      key: 'supplier', 
      header: 'Supplier',
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'date', 
      header: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'items', header: 'Items' },
    { 
      key: 'totalValue', 
      header: 'Total Value',
      render: (value) => `$${value.toLocaleString()}`
    },
  ];

  if (showCreateForm) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={[
            { label: 'Inventory', path: '/inventory' },
            { label: 'Receipts', path: '/inventory/receipts' },
            { label: 'Create New' }
          ]} />
          <ReceiptForm onCancel={() => setShowCreateForm(false)} onSuccess={() => {
            setShowCreateForm(false);
            // Refresh data or show success message
          }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage incoming stock receipts
            </p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Receipt
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by receipt number or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
            </select>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Receipts Table */}
        <DataTable 
          columns={columns}
          data={receipts}
          onRowClick={(row) => navigate(`/inventory/receipts/${row.id}`)}
          emptyMessage="No receipts found"
        />
      </div>
    </AppLayout>
  );
};

export default ReceiptListPage;
