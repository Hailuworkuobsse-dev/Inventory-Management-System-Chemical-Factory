import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import ReportFilterBar from '../components/ReportFilterBar';
import { FileCheck, AlertTriangle } from 'lucide-react';

export default function ErisExportPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRecords: 0, lastExport: null, pendingChanges: 0 });

  useEffect(() => {
    setTimeout(() => {
      setStats({ totalRecords: 1250, lastExport: '2024-01-20', pendingChanges: 15 });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ERIS Export</h1>
            <p className="text-gray-500">Export inventory data for ERIS compliance reporting</p>
          </div>
          <ExportButtons reportName="eris-export" />
        </div>

        <ReportFilterBar />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><FileCheck className="text-blue-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Records</div><div className="text-2xl font-bold">{stats.totalRecords}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg"><AlertTriangle className="text-yellow-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Pending Changes</div><div className="text-2xl font-bold">{stats.pendingChanges}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg"><FileCheck className="text-green-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Last Export</div><div className="text-2xl font-bold">{stats.lastExport}</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Export Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium">Include Stock Movements</div>
                    <div className="text-sm text-gray-500">Export all inventory transactions</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium">Include Valuation Data</div>
                    <div className="text-sm text-gray-500">Export inventory valuation amounts</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Include Batch Details</div>
                    <div className="text-sm text-gray-500">Export batch and lot information</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
              </div>
              <button className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Generate ERIS Export
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
