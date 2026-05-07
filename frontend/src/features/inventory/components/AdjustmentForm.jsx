import { useState } from 'react';
import { Edit3, AlertTriangle } from 'lucide-react';

const AdjustmentForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    itemType: 'product',
    productId: '',
    quantity: 0,
    adjustmentType: 'increase',
    reason: '',
    warehouse: '',
    location: '',
    notes: '',
    referenceNumber: '',
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
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Edit3 className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Stock Adjustment</h2>
          <p className="text-sm text-gray-500">Adjust stock levels for discrepancies or corrections</p>
        </div>
      </div>

      {/* Item Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
          <select
            value={formData.itemType}
            onChange={(e) => handleInputChange('itemType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="product">Product</option>
            <option value="batch">Batch</option>
            <option value="serial">Serial Number</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product/SKU *</label>
          <input
            type="text"
            value={formData.productId}
            onChange={(e) => handleInputChange('productId', e.target.value)}
            placeholder="Enter SKU or scan barcode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Warehouse & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
          <select
            value={formData.warehouse}
            onChange={(e) => handleInputChange('warehouse', e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Location/Bin</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., A-01-01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Adjustment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
          <select
            value={formData.adjustmentType}
            onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="increase">Increase (+)</option>
            <option value="decrease">Decrease (-)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input
            type="text"
            value={formData.referenceNumber}
            onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
            placeholder="Optional reference"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
        <select
          value={formData.reason}
          onChange={(e) => handleInputChange('reason', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a reason</option>
          <option value="damage">Damaged Goods</option>
          <option value="expiry">Expired Items</option>
          <option value="theft">Theft/Loss</option>
          <option value="count_error">Counting Error</option>
          <option value="return">Customer Return</option>
          <option value="found">Found Items</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Warning Notice */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Important Notice</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Stock adjustments are logged and require approval from a supervisor. 
            Please ensure all information is accurate before submitting.
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          placeholder="Provide additional details about this adjustment..."
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
          disabled={isSubmitting || !formData.productId || !formData.warehouse || !formData.reason || formData.quantity <= 0}
          className="px-4 py-2 border border-transparent rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Adjustment'}
        </button>
      </div>
    </form>
  );
};

export default AdjustmentForm;
