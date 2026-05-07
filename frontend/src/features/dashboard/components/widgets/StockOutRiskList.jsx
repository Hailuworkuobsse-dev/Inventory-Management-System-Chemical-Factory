import { AlertTriangle } from 'lucide-react';

const StockOutRiskList = () => {
  // Mock data - will be replaced with API data
  const atRiskItems = [
    { id: 1, sku: 'SKU-001', name: 'Widget A', currentStock: 5, minStock: 20, avgDailySales: 3 },
    { id: 2, sku: 'SKU-002', name: 'Widget B', currentStock: 8, minStock: 25, avgDailySales: 4 },
    { id: 3, sku: 'SKU-003', name: 'Component X', currentStock: 12, minStock: 30, avgDailySales: 5 },
    { id: 4, sku: 'SKU-004', name: 'Part Y', currentStock: 3, minStock: 15, avgDailySales: 2 },
  ];

  const calculateDaysUntilStockOut = (current, dailySales) => {
    if (dailySales === 0) return Infinity;
    return Math.floor(current / dailySales);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Stock-Out Risk</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {atRiskItems.length} Items
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {atRiskItems.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No items at risk</p>
          </div>
        ) : (
          atRiskItems.map((item) => {
            const daysUntilStockOut = calculateDaysUntilStockOut(item.currentStock, item.avgDailySales);
            const isCritical = daysUntilStockOut <= 3;
            
            return (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {isCritical && (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.currentStock}</span>
                        <span className="text-gray-500"> / {item.minStock}</span>
                      </p>
                      <p className="text-xs text-gray-500">Current / Min</p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        isCritical ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {daysUntilStockOut === Infinity ? 'N/A' : `${daysUntilStockOut} days`}
                      </p>
                      <p className="text-xs text-gray-500">Until stock-out</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isCritical ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min((item.currentStock / item.minStock) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <a href="/inventory/stock?filter=low-stock" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all low stock items →
        </a>
      </div>
    </div>
  );
};

export default StockOutRiskList;
