import { useState } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';

export default function ReturnForm({ orderId, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const orderItems = [
    { id: 1, product: 'Premium Arabica Beans', sku: 'COF-001', quantity: 50, unitPrice: 45 },
    { id: 2, product: 'Espresso Blend', sku: 'COF-002', quantity: 25, unitPrice: 50 },
  ];

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit({ orderId, items: selectedItems, reason, notes });
    setLoading(false);
  };

  const refundAmount = orderItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package size={20} />
              Create Return
            </h3>
            <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Items to Return
              </label>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                      ${selectedItems.includes(item.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-sm">{item.product}</div>
                        <div className="text-xs text-gray-500">SKU: {item.sku} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select reason</option>
                <option value="damaged">Damaged in Transit</option>
                <option value="wrong_item">Wrong Item Shipped</option>
                <option value="quality">Quality Issue</option>
                <option value="overage">Ordered Too Much</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Provide more details about the return"
              />
            </div>

            {selectedItems.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-green-600 mt-0.5" size={18} />
                  <div>
                    <div className="text-sm font-medium text-green-800">Refund Amount</div>
                    <div className="text-xl font-bold text-green-600">${refundAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedItems.length === 0 || !reason}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit Return'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
