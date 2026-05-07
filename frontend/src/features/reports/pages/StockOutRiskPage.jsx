import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';

const StockOutRiskPage = () => {
  const [filterType, setFilterType] = useState('all');
  const { hasPermission } = usePermission();

  // Mock data - replace with actual API call using RTK Query
  const [stockData, setStockData] = useState([
    { id: 1, productName: 'Paracetamol 500mg', currentStock: 15, minStock: 50, avgDailySales: 10, daysUntilStockout: 1.5, riskLevel: 'critical' },
    { id: 2, productName: 'Amoxicillin 250mg', currentStock: 30, minStock: 40, avgDailySales: 5, daysUntilStockout: 6, riskLevel: 'high' },
    { id: 3, productName: 'Ibuprofen 400mg', currentStock: 80, minStock: 60, avgDailySales: 8, daysUntilStockout: 10, riskLevel: 'medium' },
    { id: 4, productName: 'Omeprazole 20mg', currentStock: 120, minStock: 50, avgDailySales: 6, daysUntilStockout: 20, riskLevel: 'low' },
  ]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredData = stockData.filter(item => {
    if (filterType === 'all') return true;
    return item.riskLevel === filterType;
  });

  if (!hasPermission('view_reports')) {
    return <div className="p-4 text-red-600">Access denied. You do not have permission to view reports.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock-Out Risk Report</h1>
        <p className="text-gray-600 mt-1">Predict and prevent stock shortages</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md capitalize transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-600 rounded-lg p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Critical Risk</h3>
          <p className="text-3xl font-bold mt-1">
            {stockData.filter(item => item.riskLevel === 'critical').length}
          </p>
          <p className="text-xs opacity-75 mt-1">Immediate action needed</p>
        </div>
        <div className="bg-red-100 rounded-lg p-4 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-red-800">High Risk</h3>
          <p className="text-3xl font-bold text-red-900 mt-1">
            {stockData.filter(item => item.riskLevel === 'high').length}
          </p>
          <p className="text-xs text-red-600 mt-1">&lt; 7 days until stockout</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-yellow-800">Medium Risk</h3>
          <p className="text-3xl font-bold text-yellow-900 mt-1">
            {stockData.filter(item => item.riskLevel === 'medium').length}
          </p>
          <p className="text-xs text-yellow-600 mt-1">7-14 days until stockout</p>
        </div>
        <div className="bg-green-100 rounded-lg p-4 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-green-800">Low Risk</h3>
          <p className="text-3xl font-bold text-green-900 mt-1">
            {stockData.filter(item => item.riskLevel === 'low').length}
          </p>
          <p className="text-xs text-green-600 mt-1">&gt; 14 days until stockout</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Stock Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Daily Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Stockout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.avgDailySales}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{item.daysUntilStockout} days</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressBarColor(item.riskLevel)}`}
                          style={{ width: `${Math.min(100, (item.daysUntilStockout / 30) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                      {item.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900 mr-3">Reorder</button>
                    {item.riskLevel === 'critical' && (
                      <button className="text-red-600 hover:text-red-900">Alert</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Recommendations</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>{stockData.filter(i => i.riskLevel === 'critical').length} products require immediate reorder</li>
          <li>Consider increasing safety stock for high-turnover items</li>
          <li>Review supplier lead times for critical items</li>
        </ul>
      </div>
    </div>
  );
};

export default StockOutRiskPage;
