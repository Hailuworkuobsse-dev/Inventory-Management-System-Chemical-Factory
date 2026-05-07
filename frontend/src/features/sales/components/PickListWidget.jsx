import { Package, CheckCircle, Clock } from 'lucide-react';

export default function PickListWidget({ orderId, items }) {
  const pickList = items || [
    { id: 1, product: 'Premium Arabica Beans', sku: 'COF-001', quantity: 50, picked: 30, location: 'A-01-02' },
    { id: 2, product: 'Espresso Blend', sku: 'COF-002', quantity: 25, picked: 25, location: 'A-02-01' },
  ];

  const totalPicked = pickList.reduce((sum, item) => sum + item.picked, 0);
  const totalQuantity = pickList.reduce((sum, item) => sum + item.quantity, 0);
  const progress = (totalPicked / totalQuantity) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package size={20} />
          Pick List
        </h3>
        <span className="text-sm text-gray-500">Order #{orderId}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Picking Progress</span>
          <span className="font-medium">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {pickList.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">{item.product}</div>
              <div className="text-xs text-gray-500">SKU: {item.sku} • Location: {item.location}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {item.picked} / {item.quantity}
              </div>
              <div className="flex items-center justify-end gap-1 mt-1">
                {item.picked >= item.quantity ? (
                  <CheckCircle size={14} className="text-green-600" />
                ) : (
                  <Clock size={14} className="text-yellow-600" />
                )}
                <span className={`text-xs ${item.picked >= item.quantity ? 'text-green-600' : 'text-yellow-600'}`}>
                  {item.picked >= item.quantity ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
