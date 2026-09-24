import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../../../components/Breadcrumb';
import ReceiptForm from '../components/ReceiptForm';
import { useCreateReceiptMutation } from '../../../services/inventoryEndpoints';
import { useOfflineMutation } from '../../../hooks/useOfflineMutation';

const ReceiptCreatePage = () => {
  const navigate = useNavigate();
  const [createTrigger] = useCreateReceiptMutation();
  const [createReceipt] = useOfflineMutation(createTrigger, {
    url: '/inventory/receipts',
    method: 'POST',
    endpointName: 'getReceipts',
  });

  const handleSubmit = async (data) => {
    try {
      const result = await createReceipt(data);
      if (result.status === 'queued') {
        toast('You are offline — receipt queued and will sync automatically.', {
          icon: '📴',
          duration: 5000,
        });
      } else {
        toast.success('Goods receipt created');
      }
      navigate('/inventory/receipts');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create receipt');
    }
  };

  return (
    <>
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
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
};

export default ReceiptCreatePage;
