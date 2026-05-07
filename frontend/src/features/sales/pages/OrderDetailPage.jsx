import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Breadcrumb from '../../../components/Breadcrumb';
import StatusBadge from '../../../components/StatusBadge';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setOrder({
        id: parseInt(id),
        orderNumber: 'ORD-2024-001',
        customer: 'Cafe Central',
        customerEmail: 'orders@cafecentral.com',
        orderDate: '2024-01-20',
        status: 'completed',
        totalAmount: 3500,
        items: [
          { id: 1, product: 'Premium Arabica Beans', sku: 'COF-001', quantity: 50, unitPrice: 45, total: 2250 },
          { id: 2, product: 'Espresso Blend', sku: 'COF-002', quantity: 25, unitPrice: 50, total: 1250 },
        ],
        shippingAddress: '123 Main Street, Downtown, City 12345',
        timeline: [
          { status: 'Order Placed', date: '2024-01-20 09:00', completed: true },
          { status: 'Processing', date: '2024-01-20 14:00', completed: true },
          { status: 'Picked', date: '2024-01-21 10:00', completed: true },
          { status: 'Shipped', date: '2024-01-21 16:00', completed: true },
          { status: 'Delivered', date: '2024-01-22 11:00', completed: true },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  const breadcrumbs = [
    { label: 'Orders', href: '/sales/orders' },
    { label: order.orderNumber },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
                  <p className="text-gray-500">{order.customer} • {order.orderDate}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <DollarSign size={18} />
                  <span>Total: <strong>${order.totalAmount.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} />
                  <span>Ordered: {order.orderDate}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package size={20} />
                  Order Items
                </h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck size={18} />
                Shipping Address
              </h3>
              <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock size={18} />
                Order Timeline
              </h3>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`mt-1 ${event.completed ? 'text-green-600' : 'text-gray-300'}`}>
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <div className={`text-sm ${event.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {event.status}
                      </div>
                      <div className="text-xs text-gray-500">{event.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
