import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import ReportFilterBar from '../components/ReportFilterBar';
import { TrendingDown, Clock } from 'lucide-react';

export default function SlowMoversPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { sku: 'SKU-010', product: 'Seasonal Blend 2023', category: 'Finished Goods', stockQty: 450, lastMovement: '2023-11-15', daysSince: 67 },
        { sku: 'SKU-011', product: 'Holiday Packaging', category: 'Packaging', stockQty: 1200, lastMovement: '2023-12-20', daysSince: 32 },
        { sku: 'SKU-012', product: 'Decaf Ground 500g', category: 'Finished Goods', stockQty: 280, lastMovement: '2024-01-05', daysSince: 16 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Slow Moving Inventory</h1>
            <p className="text-gray-500">Identify items with low turnover rates</p>
          </div>
          <ExportButtons reportName="slow-movers" />
        </div>

        <ReportFilterBar />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg"><TrendingDown className="text-red-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Slow Movers Count</div><div className="text-2xl font-bold">{data.length}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="text-yellow-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Avg Days Since Movement</div><div className="text-2xl font-bold">38 days</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg"><TrendingDown className="text-purple-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Stock Value</div><div className="text-2xl font-bold">$89K</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.product}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.category}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">{row.stockQty}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">{row.lastMovement}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                          ${row.daysSince > 60 ? 'bg-red-100 text-red-800' : row.daysSince > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {row.daysSince} days
                        </span>
                      </td>
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
