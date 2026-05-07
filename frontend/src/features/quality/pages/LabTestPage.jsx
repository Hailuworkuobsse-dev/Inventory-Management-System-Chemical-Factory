import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { FlaskConical, Save } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Breadcrumb from '../../../components/Breadcrumb';
import LabTestForm from '../components/LabTestForm';

const LabTestPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Quality', path: '/quality' },
          { label: 'Lab Tests', path: '/quality/lab-tests' },
          { label: 'New Test' }
        ]} />

        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/quality/lab-tests')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FlaskConical className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Test</h1>
        </div>

        <LabTestForm 
          onCancel={() => navigate('/quality/lab-tests')}
          onSuccess={(testId) => {
            // Show success message and redirect
            navigate(`/quality/batches?test=${testId}`);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default LabTestPage;
