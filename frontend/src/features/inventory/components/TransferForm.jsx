import { useState } from 'react';
import { ArrowLeftRight, Package } from 'lucide-react';

const TransferForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    sourceWarehouse: '',
    destinationWarehouse: '',
    items: [],
    transferDate: new Date().toISOString().split('T')[0],
    notes: '',
    priority: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(Date.now());
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ArrowLeftRight className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Transfer Details</h2>
          <p className="text-sm text-gray-500">Move stock between warehouses or locations</p>
        </div>
      </div>

      {/* Warehouse Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source Warehouse *</label>
          <select
            value={formData.sourceWarehouse}
            onChange={(e) => handleInputChange('sourceWarehouse', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select warehouse</option>
            <option value="main">Main Warehouse</option>
            <option value="cold">Cold Storage</option>
            <option value="hazmat">Hazmat Storage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Warehouse *</label>
          <select
            value={formData.destinationWarehouse}
            onChange={(e) => handleInputChange('destinationWarehouse', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select warehouse</option>
            <option value="main">Main Warehouse</option>
            <option value="cold">Cold Storage</option>
            <option value="hazmat">Hazmat Storage</option>
          </select>
        </div>
      </div>

      {/* Transfer Date & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date *</label>
          <input
            type="date"
            value={formData.transferDate}
            onChange={(e) => handleInputChange('transferDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Items Section - Placeholder */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Items to Transfer</h3>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Add Items
          </button>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No items added yet. Click "Add Items" to select stock for transfer.</p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          placeholder="Add any additional information about this transfer..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.sourceWarehouse || !formData.destinationWarehouse}
          className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Transfer'}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;
