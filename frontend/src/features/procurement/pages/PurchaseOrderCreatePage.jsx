import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import POForm from '../components/POForm';
import { ArrowLeft } from 'lucide-react';

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
    { label: 'Create New' },
  ];

  const handleSubmit = async (data) => {
    // Simulate API call
    console.log('Creating PO:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate('/procurement/purchase-orders');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Purchase Order</h1>
          <POForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
        </div>
      </div>
    </AppLayout>
  );
}
