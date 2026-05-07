import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ArrowLeftCircle, Search } from 'lucide-react';

const columns = [
  { key: 'returnNumber', label: 'Return #', sortable: true },
  { key: 'orderNumber', label: 'Original Order', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'returnDate', label: 'Return Date', sortable: true },
  { key: 'refundAmount', label: 'Refund', sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function ReturnListPage() {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setReturns([
        { id: 1, returnNumber: 'RET-2024-001', orderNumber: 'ORD-2024-001', customer: 'Cafe Central', returnDate: '2024-01-25', refundAmount: 450, status: 'approved' },
        { id: 2, returnNumber: 'RET-2024-002', orderNumber: 'ORD-2024-003', customer: 'Morning Brew Ltd', returnDate: '2024-01-26', refundAmount: 280, status: 'pending' },
        { id: 3, returnNumber: 'RET-2024-003', orderNumber: 'ORD-2024-002', customer: 'Bean There Co', returnDate: '2024-01-27', refundAmount: 620, status: 'processed' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredReturns = returns.filter(r => 
    r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
          <p className="text-gray-500">Process and track product returns</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search returns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <DataTable
              data={filteredReturns}
              columns={columns}
              onRowClick={(ret) => console.log('View return:', ret)}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
