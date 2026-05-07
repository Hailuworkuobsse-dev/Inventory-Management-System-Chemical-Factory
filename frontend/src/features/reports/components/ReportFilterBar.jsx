import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';

export default function ReportFilterBar({ onFilterChange }) {
  const [dateRange, setDateRange] = useState('last30');
  const [category, setCategory] = useState('all');

  const handleApply = () => {
    onFilterChange?.({ dateRange, category });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastQuarter">Last Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="raw">Raw Materials</option>
            <option value="wip">Work in Progress</option>
            <option value="finished">Finished Goods</option>
            <option value="packaging">Packaging</option>
          </select>
        </div>

        <button
          onClick={handleApply}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Filter size={18} />
          Apply Filters
        </button>
      </div>
    </div>
  );
}
