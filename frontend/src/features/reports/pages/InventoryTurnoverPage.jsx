import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ReportFilterBar from '../components/ReportFilterBar';
import ExportButtons from '../components/ExportButtons';
import { TrendingUp, Package } from 'lucide-react';

export default function InventoryTurnoverPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { category: 'Raw Materials', turnover: 8.5, daysOnHand: 43, value: 245000 },
        { category: 'Work in Progress', turnover: 12.2, daysOnHand: 30, value: 89000 },
        { category: 'Finished Goods', turnover: 6.8, daysOnHand: 54, value: 178000 },
        { category: 'Packaging', turnover: 10.1, daysOnHand: 36, value: 45000 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Turnover Report</h1>
            <p className="text-gray-500">Analyze how quickly inventory is sold and replaced</p>
          </div>
          <ExportButtons reportName="inventory-turnover" />
        </div>

        <ReportFilterBar />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><TrendingUp className="text-blue-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Avg Turnover</div><div className="text-2xl font-bold">9.4x</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg"><Package className="text-green-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Inventory Value</div><div className="text-2xl font-bold">$557K</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg"><TrendingUp className="text-purple-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Avg Days on Hand</div><div className="text-2xl font-bold">41 days</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Turnover Ratio</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days on Hand</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Inventory Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.category}</td>
                      <td className="px-6 py-4 text-sm text-right">{row.turnover.toFixed(1)}x</td>
                      <td className="px-6 py-4 text-sm text-right">{row.daysOnHand} days</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">${row.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
