import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

export default function OrderForm({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm({
    defaultValues: {
      customerId: '',
      orderDate: new Date().toISOString().split('T')[0],
      shippingAddress: '',
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const submitHandler = async (data) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit({ ...data, totalAmount: total });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            {...register('customerId', { required: 'Customer is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select customer</option>
            <option value="1">Cafe Central</option>
            <option value="2">Bean There Co</option>
            <option value="3">Morning Brew Ltd</option>
          </select>
          {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
          <input
            {...register('orderDate', { required: true })}
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
          <textarea
            {...register('shippingAddress', { required: 'Address is required' })}
            rows={2}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.shippingAddress ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.shippingAddress && <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>}
        </div>
      </div>

      {/* Line Items */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <button type="button" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                <select {...register(`items.${index}.productId`, { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">Select product</option>
                  <option value="1">Premium Arabica Beans (kg)</option>
                  <option value="2">Espresso Blend (kg)</option>
                  <option value="3">Packaging Material (unit)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                <input {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 1 })}
                  type="number" min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                <input {...register(`items.${index}.unitPrice`, { valueAsNumber: true, min: 0 })}
                  type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <button type="button" onClick={() => remove(index)}
                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center justify-center gap-1">
                  <X size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-end">
          <div className="text-right">
            <span className="text-gray-600">Total: </span>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea {...register('notes')} rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Additional instructions" />
      </div>

      <div className="flex gap-3 pt-6 border-t">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading || items.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
