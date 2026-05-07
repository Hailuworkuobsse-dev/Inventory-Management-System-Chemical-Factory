import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X, Package } from 'lucide-react';

export default function MaterialConsumptionForm({ workOrderId, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      materials: [
        { materialId: '1', name: 'Arabica Beans', plannedQty: 250, consumedQty: 175, unit: 'kg' },
        { materialId: '2', name: 'Robusta Beans', plannedQty: 100, consumedQty: 70, unit: 'kg' },
      ],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'materials' });
  const materials = watch('materials');

  const submitHandler = async (data) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit({ workOrderId, ...data });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package size={20} />
            Record Material Consumption
          </h3>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                  {materials[index]?.name}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Planned Qty</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500">
                  {materials[index]?.plannedQty} {materials[index]?.unit}
                </div>
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Actual Consumed *</label>
                <input
                  {...register(`materials.${index}.consumedQty`, { required: true, valueAsNumber: true })}
                  type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500">
                  {materials[index]?.unit}
                </div>
              </div>
              <div className="col-span-1">
                <button type="button" onClick={() => remove(index)}
                  className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Any observations or issues" />
        </div>

        <div className="flex gap-3 pt-6 border-t mt-6">
          <button type="button" onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Record Consumption'}
          </button>
        </div>
      </div>
    </form>
  );
}
