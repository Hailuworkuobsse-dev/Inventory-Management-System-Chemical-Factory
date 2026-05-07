import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import StatusBadge from '../../../components/StatusBadge';
import AuditTimeline from '../../../components/AuditTimeline';

const BatchDetailPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - will be replaced with API data
  const batch = {
    id: parseInt(id),
    batchNumber: 'BATCH-2024-001',
    product: 'Widget A Premium',
    sku: 'SKU-001',
    quantity: 500,
    unit: 'pcs',
    status: 'released',
    manufactureDate: '2024-01-10',
    expiryDate: '2025-01-10',
    warehouse: 'Main Warehouse',
    location: 'A-01-01',
    supplier: 'ABC Supplies',
    productionLine: 'Line 1',
    qualityScore: 98.5,
    certificates: ['ISO-9001', 'CE'],
  };

  const testResults = [
    { id: 1, testName: 'Visual Inspection', date: '2024-01-11', result: 'Pass', inspector: 'John Doe' },
    { id: 2, testName: 'Dimensional Check', date: '2024-01-11', result: 'Pass', inspector: 'Jane Smith' },
    { id: 3, testName: 'Material Analysis', date: '2024-01-12', result: 'Pass', inspector: 'Lab Team' },
  ];

  const auditEvents = [
    { id: 1, event: 'Batch Created', timestamp: '2024-01-10T08:00:00Z', user: 'Production Manager' },
    { id: 2, event: 'Quality Test Initiated', timestamp: '2024-01-11T09:30:00Z', user: 'QC Inspector' },
    { id: 3, event: 'All Tests Passed', timestamp: '2024-01-12T14:00:00Z', user: 'QC Manager' },
    { id: 4, event: 'Batch Released', timestamp: '2024-01-12T16:00:00Z', user: 'Warehouse Manager' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tests', label: 'Test Results' },
    { id: 'traceability', label: 'Traceability' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Quality', path: '/quality' },
          { label: 'Batches', path: '/quality/batches' },
          { label: batch.batchNumber }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/quality/batches')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{batch.product}</h1>
              <p className="mt-1 text-sm text-gray-500">Batch: {batch.batchNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FileText className="h-4 w-4 mr-2" />
              Certificate
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Batch
            </button>
          </div>
        </div>

        {/* Status & Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-2">
              <StatusBadge status={batch.status} size="lg" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Quantity</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{batch.quantity} {batch.unit}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Quality Score</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{batch.qualityScore}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Expiry Date</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{new Date(batch.expiryDate).toLocaleDateString()}</p>
          </div>
        </div>

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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">SKU</h3>
                  <p className="text-lg font-semibold text-gray-900">{batch.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Manufacture Date</h3>
                  <p className="text-lg font-semibold text-gray-900">{new Date(batch.manufactureDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <p className="text-lg font-semibold text-gray-900">{batch.location}</p>
                  <p className="text-sm text-gray-500">{batch.warehouse}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier</h3>
                  <p className="text-lg font-semibold text-gray-900">{batch.supplier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Production Line</h3>
                  <p className="text-lg font-semibold text-gray-900">{batch.productionLine}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Certificates</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {batch.certificates.map(cert => (
                      <span key={cert} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{test.testName}</p>
                      <p className="text-sm text-gray-500">{test.date} • {test.inspector}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.result === 'Pass' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <StatusBadge status={test.result.toLowerCase()} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'traceability' && (
              <div className="text-center py-12 text-gray-500">
                Traceability chain visualization coming soon...
              </div>
            )}

            {activeTab === 'audit' && (
              <AuditTimeline events={auditEvents} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BatchDetailPage;
