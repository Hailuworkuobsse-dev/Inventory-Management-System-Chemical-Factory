import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ForexAllocationDialog({ isOpen, onClose, currency, available, onAllocate }) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPurpose('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onAllocate({ currency, amount: parseFloat(amount), purpose });
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Allocate {currency}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Balance
              </label>
              <div className="text-2xl font-bold text-gray-900">${available?.toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Amount *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={available}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose *
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the purpose of this allocation"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Allocating...' : 'Allocate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
