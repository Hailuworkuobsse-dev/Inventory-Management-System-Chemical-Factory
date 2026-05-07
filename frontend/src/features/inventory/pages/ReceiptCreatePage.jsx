import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import ReceiptForm from '../components/ReceiptForm';

const ReceiptCreatePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Inventory', path: '/inventory' },
          { label: 'Receipts', path: '/inventory/receipts' },
          { label: 'Create New' }
        ]} />

        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/inventory/receipts')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Goods Receipt</h1>
        </div>

        <ReceiptForm 
          onCancel={() => navigate('/inventory/receipts')}
          onSuccess={() => {
            // Show success message and redirect
            navigate('/inventory/receipts');
          }}
        />
      </div>
    </AppLayout>
  );
};

export default ReceiptCreatePage;
