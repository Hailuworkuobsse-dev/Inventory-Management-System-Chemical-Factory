import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import { FileText, DollarSign } from 'lucide-react';

export default function TaxExportPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTransactions: 0, taxAmount: 0, lastExport: null });

  useEffect(() => {
    setTimeout(() => {
      setStats({ totalTransactions: 3420, taxAmount: 125000, lastExport: '2024-01-19' });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Export</h1>
            <p className="text-gray-500">Generate tax reports for compliance filing</p>
          </div>
          <ExportButtons reportName="tax-export" />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><FileText className="text-blue-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Transactions</div><div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="text-green-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Tax Amount</div><div className="text-2xl font-bold">${stats.taxAmount.toLocaleString()}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg"><FileText className="text-purple-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Last Export</div><div className="text-2xl font-bold">{stats.lastExport}</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Tax Report Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Report Type</h3>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>VAT Report</option>
                    <option>Sales Tax Report</option>
                    <option>ICMS Report (Brazil)</option>
                    <option>Custom Export</option>
                  </select>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Period</h3>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Current Month</option>
                    <option>Last Month</option>
                    <option>Current Quarter</option>
                    <option>Last Quarter</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>
              <button className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Generate Tax Report
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
