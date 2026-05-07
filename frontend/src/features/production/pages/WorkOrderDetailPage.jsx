import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Breadcrumb from '../../../components/Breadcrumb';
import StatusBadge from '../../../components/StatusBadge';
import MaterialAvailabilityGauge from '../components/MaterialAvailabilityGauge';
import YieldChart from '../components/YieldChart';
import { ArrowLeft, ClipboardList, Calendar, Package, CheckCircle } from 'lucide-react';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setOrder({
        id: parseInt(id),
        workOrderNumber: 'WO-2024-001',
        productName: 'Premium Coffee Blend',
        quantity: 500,
        producedQty: 350,
        startDate: '2024-01-20',
        dueDate: '2024-01-25',
        status: 'in_progress',
        bomVersion: '2.1',
        materials: [
          { name: 'Arabica Beans', required: 250, consumed: 175, unit: 'kg' },
          { name: 'Robusta Beans', required: 100, consumed: 70, unit: 'kg' },
          { name: 'Packaging Bags', required: 500, consumed: 350, unit: 'pcs' },
          { name: 'Labels', required: 500, consumed: 350, unit: 'pcs' },
        ],
        timeline: [
          { date: '2024-01-20 08:00', event: 'Work Order Created', completed: true },
          { date: '2024-01-20 10:00', event: 'Materials Allocated', completed: true },
          { date: '2024-01-20 14:00', event: 'Production Started', completed: true },
          { date: 'Expected 2024-01-25', event: 'Quality Check', completed: false },
          { date: 'Expected 2024-01-25', event: 'Completion', completed: false },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  const breadcrumbs = [
    { label: 'Work Orders', href: '/production/work-orders' },
    { label: order.workOrderNumber },
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

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order.workOrderNumber}</h1>
              <p className="text-gray-500">{order.productName} • BOM v{order.bomVersion}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Target Quantity</div>
              <div className="text-xl font-bold">{order.quantity} units</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Produced</div>
              <div className="text-xl font-bold text-green-600">{order.producedQty} units</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> Start</div>
              <div className="font-medium">{order.startDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> Due</div>
              <div className="font-medium">{order.dueDate}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materials */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} />
              Material Consumption
            </h3>
            <div className="space-y-4">
              {order.materials.map((mat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{mat.name}</span>
                    <span>{mat.consumed} / {mat.required} {mat.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(mat.consumed/mat.required)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Gauge */}
          <MaterialAvailabilityGauge materials={order.materials} />
        </div>

        {/* Timeline & Yield */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList size={20} />
              Production Timeline
            </h3>
            <div className="space-y-3">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`mt-1 ${event.completed ? 'text-green-600' : 'text-gray-300'}`}>
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <div className={`text-sm ${event.completed ? 'text-gray-900' : 'text-gray-400'}`}>{event.event}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <YieldChart target={order.quantity} actual={order.producedQty} />
        </div>
      </div>
    </AppLayout>
  );
}
