import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import Breadcrumb from '../../../components/Breadcrumb';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { useGetReceiptsQuery } from '../../../services/inventoryEndpoints';

const ReceiptListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading, isError, refetch } = useGetReceiptsQuery();
  const allReceipts = Array.isArray(response) ? response : response?.data || [];

  const receipts = allReceipts.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      (!searchTerm ||
        r.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: 'receiptNumber', header: 'Receipt Number' },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (_, row) => <span className="font-medium">{row.supplier?.name || '-'}</span>,
    },
    { key: 'receiptDate', header: 'Date', render: (v) => v || '-' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'items', header: 'Items', render: (_, row) => row.items?.length ?? row.itemCount ?? '-' },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (value) => (value != null ? `${Number(value).toLocaleString()}` : '-'),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Inventory', path: '/inventory' },
          { label: 'Receipts' }
        ]} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Goods Receipts</h1>
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
              New Receipt
            </button>
          </div>
        </div>

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
            <div className="sm:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-10 flex justify-center"><LoadingSpinner /></div>
          ) : isError ? (
            <EmptyState title="Could not load receipts" message="Check your connection and retry." onRetry={() => refetch()} />
          ) : receipts.length === 0 ? (
            <EmptyState title="No receipts" message="Create a goods receipt to get started." />
          ) : (
            <DataTable columns={columns} data={receipts} />
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiptListPage;
