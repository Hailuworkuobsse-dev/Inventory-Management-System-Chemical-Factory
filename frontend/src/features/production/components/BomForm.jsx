import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X, Package } from 'lucide-react';

export default function BomForm({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      productName: '',
      version: '1.0',
      description: '',
      materials: [{ materialId: '', quantity: 0, unit: 'kg', wasteFactor: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'materials' });

  const submitHandler = async (data) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input {...register('productName', { required: 'Required' })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Premium Coffee Blend" />
          {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
          <input {...register('version', { required: 'Required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="1.0" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Product description" />
        </div>
      </div>

      {/* Materials */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Package size={20} />Materials</h3>
          <button type="button" onClick={() => append({ materialId: '', quantity: 0, unit: 'kg', wasteFactor: 0 })}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={16} /> Add Material
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                <select {...register(`materials.${index}.materialId`, { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">Select material</option>
                  <option value="1">Arabica Beans</option>
                  <option value="2">Robusta Beans</option>
                  <option value="3">Packaging Bags</option>
                  <option value="4">Labels</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                <input {...register(`materials.${index}.quantity`, { valueAsNumber: true, min: 0 })}
                  type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select {...register(`materials.${index}.unit`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="pcs">pcs</option>
                  <option value="L">L</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Waste %</label>
                <input {...register(`materials.${index}.wasteFactor`, { valueAsNumber: true, min: 0, max: 100 })}
                  type="number" min="0" max="100" step="0.1"
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
      </div>

      <div className="flex gap-3 pt-6 border-t">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Create BOM'}
        </button>
      </div>
    </form>
  );
}
