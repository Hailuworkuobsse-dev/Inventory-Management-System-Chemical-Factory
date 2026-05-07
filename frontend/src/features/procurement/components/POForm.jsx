import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X, Package, Calendar, DollarSign } from 'lucide-react';

export default function POForm({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm({
    defaultValues: {
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      currency: 'USD',
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const total = subtotal + totalTax;

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier *
          </label>
          <select
            {...register('supplierId', { required: 'Supplier is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.supplierId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select supplier</option>
            <option value="1">Green Farms Ltd</option>
            <option value="2">Pacific Trading Co</option>
            <option value="3">Euro Supplies GmbH</option>
          </select>
          {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Date *
          </label>
          <input
            {...register('orderDate', { required: 'Order date is required' })}
            type="date"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.orderDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.orderDate && <p className="mt-1 text-sm text-red-600">{errors.orderDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Delivery *
          </label>
          <input
            {...register('expectedDelivery', { required: 'Expected delivery is required' })}
            type="date"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expectedDelivery ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.expectedDelivery && <p className="mt-1 text-sm text-red-600">{errors.expectedDelivery.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            {...register('currency')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="BRL">BRL - Brazilian Real</option>
          </select>
        </div>
      </div>

      {/* Line Items */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <button
            type="button"
            onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, taxRate: 0 })}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                <select
                  {...register(`items.${index}.productId`, { required: 'Product is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product</option>
                  <option value="1">Raw Coffee Beans (kg)</option>
                  <option value="2">Packaging Material (unit)</option>
                  <option value="3">Label Stock (roll)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                <input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 1 })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                <input
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true, min: 0 })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Tax %</label>
                <input
                  {...register(`items.${index}.taxRate`, { valueAsNumber: true, min: 0, max: 100 })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t mt-2 pt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional instructions or comments"
        />
      </div>

      <div className="flex gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  );
}
