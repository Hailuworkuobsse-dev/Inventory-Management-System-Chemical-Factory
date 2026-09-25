import { useState } from 'react';
import { useGetBomsQuery } from '../../../services/productionEndpoints';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Plus, Package, Search } from 'lucide-react';

const columns = [
  { key: 'bomCode', label: 'BOM Code', sortable: true },
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'version', label: 'Version', sortable: true },
  { key: 'materialCount', label: 'Materials', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function BomListPage() {
  const navigate = useNavigate();
  const { data: response, isLoading: loading, isError, refetch } = useGetBomsQuery();
  const raw = Array.isArray(response) ? response : response?.data || [];
  const boms = raw.map((b) => ({
    id: b.id,
    bomCode: b.code || b.bomCode,
    productName: b.product?.name || b.name || '-',
    version: b.version || '1.0',
    materialCount: b.items?.length ?? b.materialCount ?? 0,
    status: b.status || (b.isActive === false ? 'draft' : 'active'),
  }));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBoms = boms.filter(b => 
    b.bomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
            <p className="text-gray-500">Manage product recipes and material lists</p>
          </div>
          <button
            onClick={() => navigate('/production/boms/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create BOM
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredBoms.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No BOMs found"
            description="Create your first bill of materials"
            actionLabel="Create BOM"
            onAction={() => navigate('/production/boms/new')}
          />
        ) : (
          <DataTable
            data={filteredBoms}
            columns={columns}
            onRowClick={(bom) => navigate(`/production/boms/${bom.id}`)}
          />
        )}
      </div>
    </>
  );
}
