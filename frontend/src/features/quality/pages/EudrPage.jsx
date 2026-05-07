import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { FileCheck, Download, Upload } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';

const EudrPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const complianceRecords = [
    { id: 1, productCode: 'WOOD-001', productName: 'Oak Timber', supplier: 'Forest Co.', status: 'compliant', dueDiligenceDate: '2024-01-10', geolocation: 'Verified', documents: 5 },
    { id: 2, productCode: 'WOOD-002', productName: 'Pine Boards', supplier: 'Timber Ltd.', status: 'pending', dueDiligenceDate: '2024-01-15', geolocation: 'Pending', documents: 2 },
    { id: 3, productCode: 'RUBBER-001', productName: 'Natural Rubber', supplier: 'Rubber Inc.', status: 'compliant', dueDiligenceDate: '2024-01-12', geolocation: 'Verified', documents: 8 },
  ];

  const columns = [
    { key: 'productCode', header: 'Product Code', render: (value) => <span className="font-medium">{value}</span> },
    { key: 'productName', header: 'Product Name' },
    { key: 'supplier', header: 'Supplier' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => <StatusBadge status={value === 'compliant' ? 'success' : 'warning'} />
    },
    { 
      key: 'dueDiligenceDate', 
      header: 'Due Diligence Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'geolocation', 
      header: 'Geolocation',
      render: (value) => (
        <span className={value === 'Verified' ? 'text-green-600' : 'text-yellow-600'}>
          {value}
        </span>
      )
    },
    { key: 'documents', header: 'Documents' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EUDR Compliance</h1>
            <p className="mt-1 text-sm text-gray-500">
              EU Deforestation Regulation compliance tracking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export DDS
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">EUDR Requirements</h4>
              <p className="text-sm text-blue-700 mt-1">
                Ensure all relevant products have complete due diligence statements (DDS) with verified geolocation data. 
                Products must be deforestation-free and produced in accordance with relevant legislation.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">24</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Compliant</p>
            <p className="mt-2 text-2xl font-bold text-green-600">18</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Non-Compliant</p>
            <p className="mt-2 text-2xl font-bold text-red-600">1</p>
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
              <option value="compliant">Compliant</option>
              <option value="pending">Pending</option>
              <option value="non-compliant">Non-Compliant</option>
            </select>
          </div>
        </div>

        {/* Compliance Table */}
        <DataTable 
          columns={columns}
          data={complianceRecords}
          emptyMessage="No compliance records found"
        />
      </div>
    </AppLayout>
  );
};

export default EudrPage;
