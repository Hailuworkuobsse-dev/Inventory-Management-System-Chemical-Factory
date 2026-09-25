import { useState } from 'react';
import { useGetWorkOrdersQuery } from '../../../services/productionEndpoints';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Plus, Search } from 'lucide-react';

const columns = [
  { key: 'workOrderNumber', label: 'WO #', sortable: true },
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'quantity', label: 'Qty', sortable: true },
  { key: 'startDate', label: 'Start Date', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function WorkOrderListPage() {
  const navigate = useNavigate();
  const { data: response, isLoading: loading, isError, refetch } = useGetWorkOrdersQuery();
  const raw = Array.isArray(response) ? response : response?.data || [];
  const orders = raw.map((wo) => ({
    id: wo.id,
    workOrderNumber: wo.orderNumber || wo.workOrderNumber,
    productName: wo.product?.name || wo.productName || '-',
    quantity: wo.plannedQuantity ?? wo.quantity ?? 0,
    startDate: (wo.startDate || '').slice(0, 10),
    dueDate: (wo.dueDate || '').slice(0, 10),
    status: wo.status || 'pending',
  }));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => 
    o.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            <p className="text-gray-500">Manage production work orders</p>
          </div>
          <button
            onClick={() => navigate('/production/work-orders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Work Order
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <DataTable
              data={filteredOrders}
              columns={columns}
              onRowClick={(order) => navigate(`/production/work-orders/${order.id}`)}
            />
          </div>
        )}
      </div>
    </>
  );
}
