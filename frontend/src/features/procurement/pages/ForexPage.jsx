import { useState, useEffect } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

const columns = [
  { key: 'currency', label: 'Currency', sortable: true },
  { key: 'rate', label: 'Exchange Rate', sortable: true },
  { key: 'change24h', label: '24h Change', sortable: true, render: (v) => (
    <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>
      {v >= 0 ? '+' : ''}{v}%
    </span>
  )},
  { key: 'allocated', label: 'Allocated', sortable: true },
  { key: 'available', label: 'Available', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function ForexPage() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setRates([
        { id: 1, currency: 'USD', rate: 1.0, change24h: 0.12, allocated: 450000, available: 150000, status: 'active' },
        { id: 2, currency: 'EUR', rate: 0.92, change24h: -0.34, allocated: 280000, available: 72000, status: 'active' },
        { id: 3, currency: 'GBP', rate: 0.79, change24h: 0.08, allocated: 120000, available: 30000, status: 'active' },
        { id: 4, currency: 'BRL', rate: 4.97, change24h: 1.23, allocated: 890000, available: 210000, status: 'active' },
        { id: 5, currency: 'CNY', rate: 7.19, change24h: -0.15, allocated: 340000, available: 60000, status: 'limited' },
      ]);
      setTotalAllocated(2080000);
      setTotalAvailable(522000);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foreign Exchange</h1>
          <p className="text-gray-500">Manage currency allocations and exchange rates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Allocated</div>
                <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Available</div>
                <div className="text-2xl font-bold">${totalAvailable.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <RefreshCw className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Active Currencies</div>
                <div className="text-2xl font-bold">{rates.filter(r => r.status === 'active').length}</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Exchange Rates & Allocations</h2>
            </div>
            <DataTable
              data={rates}
              columns={columns}
              onRowClick={(rate) => console.log('View rate:', rate)}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
