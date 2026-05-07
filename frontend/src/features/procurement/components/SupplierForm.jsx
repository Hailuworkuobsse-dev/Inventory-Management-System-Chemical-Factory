import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Plus, X } from 'lucide-react';

export default function SupplierForm({ initialData, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(initialData?.categories || []);
  const [newCategory, setNewCategory] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: '',
      code: '',
      category: '',
      country: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      paymentTerms: 'Net 30',
      leadTimeDays: 14,
      status: 'active',
    },
  });

  const handleAddCategory = () => {
    if (newCategory.trim() && !items.includes(newCategory.trim())) {
      setItems([...items, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const submitHandler = async (data) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit({ ...data, categories: items });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter supplier name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Code *
          </label>
          <input
            {...register('code', { required: 'Code is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., SUP001"
          />
          {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Category *
          </label>
          <input
            {...register('category', { required: 'Category is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Raw Materials"
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            {...register('country', { required: 'Country is required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Brazil"
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email *
          </label>
          <input
            {...register('contactEmail', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="contact@supplier.com"
          />
          {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            {...register('contactPhone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            {...register('address')}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms
          </label>
          <select
            {...register('paymentTerms')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lead Time (Days)
          </label>
          <input
            {...register('leadTimeDays', { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="14"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add category"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {item}
              <button type="button" onClick={() => handleRemoveCategory(index)} className="hover:text-blue-600">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
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
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Supplier' : 'Create Supplier')}
        </button>
      </div>
    </form>
  );
}
