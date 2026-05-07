import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Plus, FileText, Search, Filter } from 'lucide-react';

const columns = [
  { key: 'poNumber', label: 'PO Number', sortable: true },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'orderDate', label: 'Order Date', sortable: true },
  { key: 'expectedDelivery', label: 'Expected Delivery', sortable: true },
  { key: 'totalAmount', label: 'Total Amount', sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        { id: 1, poNumber: 'PO-2024-001', supplier: 'Green Farms Ltd', orderDate: '2024-01-15', expectedDelivery: '2024-01-29', totalAmount: 45000, status: 'received' },
        { id: 2, poNumber: 'PO-2024-002', supplier: 'Pacific Trading Co', orderDate: '2024-01-18', expectedDelivery: '2024-02-01', totalAmount: 23500, status: 'in_transit' },
        { id: 3, poNumber: 'PO-2024-003', supplier: 'Euro Supplies GmbH', orderDate: '2024-01-20', expectedDelivery: '2024-02-05', totalAmount: 67800, status: 'pending' },
        { id: 4, poNumber: 'PO-2024-004', supplier: 'Local Distributors Inc', orderDate: '2024-01-22', expectedDelivery: '2024-01-29', totalAmount: 12300, status: 'approved' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredOrders = orders.filter(o => 
    o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-500">Track and manage purchase orders</p>
          </div>
          <button
            onClick={() => navigate('/procurement/purchase-orders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create PO
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search POs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No purchase orders found"
            description="Create your first purchase order"
            actionLabel="Create PO"
            onAction={() => navigate('/procurement/purchase-orders/new')}
          />
        ) : (
          <DataTable
            data={filteredOrders}
            columns={columns}
            onRowClick={(order) => navigate(`/procurement/purchase-orders/${order.id}`)}
          />
        )}
      </div>
    </AppLayout>
  );
}
