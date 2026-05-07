import { useState } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Users, Package, TrendingUp, Clock } from 'lucide-react';

export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(true);

  useState(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const stats = [
    { label: 'Total Orders', value: '156', icon: Package, color: 'blue' },
    { label: 'Pending Orders', value: '12', icon: Clock, color: 'yellow' },
    { label: 'Total Spend', value: '$45,280', icon: TrendingUp, color: 'green' },
    { label: 'Active Contracts', value: '8', icon: Users, color: 'purple' },
  ];

  const recentOrders = [
    { id: 1, orderNumber: 'ORD-2024-001', date: '2024-01-20', total: 3500, status: 'completed' },
    { id: 2, orderNumber: 'ORD-2024-002', date: '2024-01-21', total: 5200, status: 'processing' },
    { id: 3, orderNumber: 'ORD-2024-003', date: '2024-01-22', total: 2800, status: 'pending' },
  ];

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-500">Self-service portal for customers to track orders and manage account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">${order.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Package className="mx-auto text-blue-600 mb-2" size={24} />
              <div className="text-sm font-medium">Place Order</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
              <div className="text-sm font-medium">View Invoices</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Clock className="mx-auto text-yellow-600 mb-2" size={24} />
              <div className="text-sm font-medium">Track Shipment</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <Users className="mx-auto text-purple-600 mb-2" size={24} />
              <div className="text-sm font-medium">Contact Support</div>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
