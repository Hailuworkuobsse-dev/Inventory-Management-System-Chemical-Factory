import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';import Breadcrumb from '../../../components/Breadcrumb';
import TransferForm from '../components/TransferForm';

const TransferPage = () => {
    const navigate = useNavigate();

  return (
    <>

      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Inventory', path: '/inventory' },
          { label: 'Transfers', path: '/inventory/transfers' },
          { label: 'New Transfer' }
        ]} />

        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/inventory/transfers')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfer</h1>
        </div>

        <TransferForm 
          onCancel={() => navigate('/inventory/transfers')}
          onSuccess={(transferId) => {
            // Show success message and redirect
            navigate(`/inventory/transfers/${transferId}`);
          }}
        />
      </div>
    </>
  );
};

export default TransferPage;
