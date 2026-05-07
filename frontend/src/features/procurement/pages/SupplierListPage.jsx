import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Plus, Building2, Search } from 'lucide-react';

const columns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'country', label: 'Country', sortable: true },
  { key: 'rating', label: 'Rating', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function SupplierListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSuppliers([
        { id: 1, code: 'SUP001', name: 'Green Farms Ltd', category: 'Raw Materials', country: 'Brazil', rating: 4.8, status: 'active' },
        { id: 2, code: 'SUP002', name: 'Pacific Trading Co', category: 'Packaging', country: 'China', rating: 4.5, status: 'active' },
        { id: 3, code: 'SUP003', name: 'Euro Supplies GmbH', category: 'Equipment', country: 'Germany', rating: 4.9, status: 'active' },
        { id: 4, code: 'SUP004', name: 'Local Distributors Inc', category: 'Raw Materials', country: 'USA', rating: 3.8, status: 'inactive' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-500">Manage your supplier relationships</p>
          </div>
          <button
            onClick={() => navigate('/procurement/suppliers/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Supplier
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No suppliers found"
            description="Start by adding your first supplier"
            actionLabel="Add Supplier"
            onAction={() => navigate('/procurement/suppliers/new')}
          />
        ) : (
          <DataTable
            data={filteredSuppliers}
            columns={columns}
            onRowClick={(supplier) => navigate(`/procurement/suppliers/${supplier.id}`)}
          />
        )}
      </div>
    </AppLayout>
  );
}
