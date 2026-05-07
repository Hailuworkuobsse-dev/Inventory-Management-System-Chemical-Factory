import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import { ClipboardCheck, FileCheck, AlertCircle } from 'lucide-react';

export default function AuditReportPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAudits: 0, openIssues: 0, lastAudit: null });

  useEffect(() => {
    setTimeout(() => {
      setStats({ totalAudits: 48, openIssues: 3, lastAudit: '2024-01-15' });
      setLoading(false);
    }, 500);
  }, []);

  const auditTrail = [
    { date: '2024-01-20', user: 'John Smith', action: 'Stock Adjustment', entity: 'SKU-001', details: 'Adjusted qty from 100 to 95' },
    { date: '2024-01-19', user: 'Maria Silva', action: 'Price Change', entity: 'SKU-002', details: 'Updated price from $50 to $55' },
    { date: '2024-01-18', user: 'System', action: 'Auto Reorder', entity: 'PO-2024-005', details: 'Generated purchase order' },
    { date: '2024-01-17', user: 'John Smith', action: 'User Access', entity: 'user@company.com', details: 'Granted warehouse access' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Report</h1>
            <p className="text-gray-500">Track all system changes and compliance activities</p>
          </div>
          <ExportButtons reportName="audit-report" />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><ClipboardCheck className="text-blue-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Total Audits</div><div className="text-2xl font-bold">{stats.totalAudits}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="text-red-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Open Issues</div><div className="text-2xl font-bold">{stats.openIssues}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg"><FileCheck className="text-green-600" size={24} /></div>
                  <div><div className="text-sm text-gray-500">Last Audit Date</div><div className="text-2xl font-bold">{stats.lastAudit}</div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recent Audit Trail</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditTrail.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.entity}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.details}</td>
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
