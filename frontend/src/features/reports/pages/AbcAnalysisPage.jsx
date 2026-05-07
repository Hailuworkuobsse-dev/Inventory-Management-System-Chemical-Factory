import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import ReportFilterBar from '../components/ReportFilterBar';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function AbcAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { sku: 'SKU-001', product: 'Premium Arabica Beans', category: 'A', annualValue: 125000, percentage: 45 },
        { sku: 'SKU-002', product: 'Espresso Blend', category: 'A', annualValue: 98000, percentage: 35 },
        { sku: 'SKU-003', product: 'Packaging Bags', category: 'B', annualValue: 45000, percentage: 16 },
        { sku: 'SKU-004', product: 'Labels', category: 'B', annualValue: 22000, percentage: 8 },
        { sku: 'SKU-005', product: 'Cleaning Supplies', category: 'C', annualValue: 5000, percentage: 2 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ABC Analysis</h1>
            <p className="text-gray-500">Classify inventory by value and importance</p>
          </div>
          <ExportButtons reportName="abc-analysis" />
        </div>

        <ReportFilterBar />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm text-gray-500">Category A Items</div><div className="text-2xl font-bold">2</div></div>
                  <div className="text-green-600 font-bold">70% Value</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-yellow-500">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm text-gray-500">Category B Items</div><div className="text-2xl font-bold">2</div></div>
                  <div className="text-yellow-600 font-bold">20% Value</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm text-gray-500">Category C Items</div><div className="text-2xl font-bold">1</div></div>
                  <div className="text-red-600 font-bold">10% Value</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.product}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                          ${row.category === 'A' ? 'bg-green-100 text-green-800' : 
                            row.category === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">${row.annualValue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">{row.percentage}%</td>
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
