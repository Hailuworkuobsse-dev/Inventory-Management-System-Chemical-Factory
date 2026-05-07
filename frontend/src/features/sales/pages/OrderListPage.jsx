import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Plus, ShoppingCart, Search, Filter } from 'lucide-react';

const columns = [
  { key: 'orderNumber', label: 'Order #', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'orderDate', label: 'Order Date', sortable: true },
  { key: 'totalAmount', label: 'Total', sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        { id: 1, orderNumber: 'ORD-2024-001', customer: 'Cafe Central', orderDate: '2024-01-20', totalAmount: 3500, status: 'completed' },
        { id: 2, orderNumber: 'ORD-2024-002', customer: 'Bean There Co', orderDate: '2024-01-21', totalAmount: 5200, status: 'processing' },
        { id: 3, orderNumber: 'ORD-2024-003', customer: 'Morning Brew Ltd', orderDate: '2024-01-22', totalAmount: 2800, status: 'pending' },
        { id: 4, orderNumber: 'ORD-2024-004', customer: 'Espresso Express', orderDate: '2024-01-22', totalAmount: 4100, status: 'shipped' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-gray-500">Manage customer orders and fulfillments</p>
          </div>
          <button
            onClick={() => navigate('/sales/orders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
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
            icon={ShoppingCart}
            title="No orders found"
            description="Create your first sales order"
            actionLabel="New Order"
            onAction={() => navigate('/sales/orders/new')}
          />
        ) : (
          <DataTable
            data={filteredOrders}
            columns={columns}
            onRowClick={(order) => navigate(`/sales/orders/${order.id}`)}
          />
        )}
      </div>
    </AppLayout>
  );
}
