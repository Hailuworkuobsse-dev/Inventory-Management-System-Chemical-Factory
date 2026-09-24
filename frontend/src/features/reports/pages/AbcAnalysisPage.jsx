import { useState } from 'react';
import { useGetAbcAnalysisQuery } from '../../../services/reportingEndpoints';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import ReportFilterBar from '../components/ReportFilterBar';

export default function AbcAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const { data: response, isLoading: loading, isError, refetch } = useGetAbcAnalysisQuery();
  const raw = Array.isArray(response) ? response : response?.data || response?.items || [];
  const data = raw.map((r) => ({
    sku: r.sku || r.product?.sku || '-',
    product: r.product || r.productName || r.product?.name || '-',
    category: r.category || r.abcClass || '-',
    annualValue: Number(r.annualValue ?? r.value ?? 0),
    percentage: Number(r.percentage ?? r.share ?? 0),
  }));

  return (
    <>

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
    </>
  );
}
