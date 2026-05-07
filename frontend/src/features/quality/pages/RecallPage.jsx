import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import RecallInitiateDialog from '../components/RecallInitiateDialog';

const RecallPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [filter, setFilter] = useState('all');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const recalls = [
    { id: 1, recallNumber: 'REC-2024-001', batchNumber: 'BATCH-2023-045', product: 'Widget X', reason: 'Quality Issue', status: 'completed', date: '2024-01-05', affectedQuantity: 200 },
    { id: 2, recallNumber: 'REC-2024-002', batchNumber: 'BATCH-2024-008', product: 'Component Y', reason: 'Safety Concern', status: 'active', date: '2024-01-18', affectedQuantity: 500 },
  ];

  const columns = [
    { key: 'recallNumber', header: 'Recall Number', render: (value) => <span className="font-medium">{value}</span> },
    { key: 'batchNumber', header: 'Batch Number' },
    { key: 'product', header: 'Product' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { 
      key: 'date', 
      header: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: 'affectedQuantity', header: 'Affected Qty' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Recalls</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track product recall processes
            </p>
          </div>
          <button 
            onClick={() => setShowRecallDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Initiate Recall
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Important Notice</h4>
              <p className="text-sm text-red-700 mt-1">
                Product recalls are critical quality actions that require immediate attention and proper documentation. 
                Ensure all regulatory requirements are met before initiating a recall.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Recalls Table */}
        <DataTable 
          columns={columns}
          data={recalls}
          onRowClick={(row) => navigate(`/quality/recalls/${row.id}`)}
          emptyMessage="No recalls found"
        />

        {/* Recall Initiate Dialog */}
        {showRecallDialog && (
          <RecallInitiateDialog
            onClose={() => setShowRecallDialog(false)}
            onSuccess={(recallId) => {
              setShowRecallDialog(false);
              navigate(`/quality/recalls/${recallId}`);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default RecallPage;
