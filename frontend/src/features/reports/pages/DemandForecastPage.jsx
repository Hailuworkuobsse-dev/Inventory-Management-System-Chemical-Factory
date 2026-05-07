import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';

const DemandForecastPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { hasPermission } = usePermission();

  // Mock data - replace with actual API call using RTK Query
  const [forecastData, setForecastData] = useState([
    { id: 1, productName: 'Paracetamol 500mg', category: 'Analgesics', currentDemand: 10, forecastedDemand: 12, trend: 'increasing', confidence: 85 },
    { id: 2, productName: 'Amoxicillin 250mg', category: 'Antibiotics', currentDemand: 5, forecastedDemand: 6, trend: 'stable', confidence: 90 },
    { id: 3, productName: 'Ibuprofen 400mg', category: 'Analgesics', currentDemand: 8, forecastedDemand: 7, trend: 'decreasing', confidence: 78 },
    { id: 4, productName: 'Omeprazole 20mg', category: 'Gastro', currentDemand: 6, forecastedDemand: 8, trend: 'increasing', confidence: 82 },
    { id: 5, productName: 'Metformin 500mg', category: 'Diabetes', currentDemand: 15, forecastedDemand: 16, trend: 'stable', confidence: 92 },
  ]);

  const categories = ['all', 'Analgesics', 'Antibiotics', 'Gastro', 'Diabetes'];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredData = forecastData.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const totalCurrentDemand = forecastData.reduce((sum, item) => sum + item.currentDemand, 0);
  const totalForecastedDemand = forecastData.reduce((sum, item) => sum + item.forecastedDemand, 0);
  const avgConfidence = Math.round(forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length);

  if (!hasPermission('view_reports')) {
    return <div className="p-4 text-red-600">Access denied. You do not have permission to view reports.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demand Forecast Report</h1>
        <p className="text-gray-600 mt-1">AI-powered demand predictions for inventory planning</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Next 7 Days</option>
              <option value="30">Next 30 Days</option>
              <option value="60">Next 60 Days</option>
              <option value="90">Next 90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Generate Forecast
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-blue-800">Current Demand</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalCurrentDemand} units/day</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-purple-800">Forecasted Demand</h3>
          <p className="text-2xl font-bold text-purple-900 mt-1">{totalForecastedDemand} units/day</p>
          <p className="text-xs text-purple-600 mt-1">
            {((totalForecastedDemand - totalCurrentDemand) / totalCurrentDemand * 100).toFixed(1)}% change
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-green-800">Avg Confidence</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">{avgConfidence}%</p>
          <p className="text-xs text-green-600 mt-1">Model accuracy</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
          <h3 className="text-sm font-medium text-indigo-800">Products Analyzed</h3>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{forecastData.length}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Demand Forecast by Product</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentDemand} units/day</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.forecastedDemand} units/day</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)} {item.trend.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                      <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.confidence >= 90 ? 'bg-green-500' : item.confidence >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${item.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                    <button className="text-green-600 hover:text-green-900">Plan Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-lg font-medium text-green-900 mb-2">Key Insights</h3>
          <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
            <li>Demand for Analgesics is expected to increase by 15%</li>
            <li>Antibiotics show stable demand patterns</li>
            <li>Consider stocking up on high-confidence forecast items</li>
          </ul>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>Increase Paracetamol stock by 20% for next month</li>
            <li>Review supplier contracts for high-demand items</li>
            <li>Monitor low-confidence forecasts closely</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastPage;
