import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import OrderForm from '../components/OrderForm';
import { ArrowLeft } from 'lucide-react';

export default function OrderCreatePage() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Orders', href: '/sales/orders' },
    { label: 'Create New' },
  ];

  const handleSubmit = async (data) => {
    console.log('Creating order:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate('/sales/orders');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Sales Order</h1>
          <OrderForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
        </div>
      </div>
    </AppLayout>
  );
}
