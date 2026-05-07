import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';

const ExpiryRiskPage = () => {
  const [dateRange, setDateRange] = useState({ start: 30, end: 90 });
  const { hasPermission } = usePermission();

  // Mock data - replace with actual API call using RTK Query
  const [expiryData, setExpiryData] = useState([
    { id: 1, productName: 'Paracetamol 500mg', batchNo: 'B001', expiryDate: '2024-06-15', quantity: 100, riskLevel: 'high' },
    { id: 2, productName: 'Amoxicillin 250mg', batchNo: 'B002', expiryDate: '2024-07-20', quantity: 50, riskLevel: 'medium' },
    { id: 3, productName: 'Ibuprofen 400mg', batchNo: 'B003', expiryDate: '2024-08-10', quantity: 200, riskLevel: 'low' },
  ]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('view_reports')) {
    return <div className="p-4 text-red-600">Access denied. You do not have permission to view reports.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expiry Risk Report</h1>
        <p className="text-gray-600 mt-1">Monitor products approaching expiry date</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days From</label>
            <input
              type="number"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days To</label>
            <input
              type="number"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-red-800">High Risk</h3>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {expiryData.filter(item => item.riskLevel === 'high').length}
          </p>
          <p className="text-xs text-red-600 mt-1">Products expiring within {dateRange.start} days</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-yellow-800">Medium Risk</h3>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {expiryData.filter(item => item.riskLevel === 'medium').length}
          </p>
          <p className="text-xs text-yellow-600 mt-1">Products expiring in {dateRange.start}-{dateRange.end} days</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-green-800">Low Risk</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {expiryData.filter(item => item.riskLevel === 'low').length}
          </p>
          <p className="text-xs text-green-600 mt-1">Products expiring after {dateRange.end} days</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Products at Risk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expiryData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.batchNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expiryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                      {item.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-red-600 hover:text-red-900">Alert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpiryRiskPage;
