import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Breadcrumb from '../../../components/Breadcrumb';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Star, TrendingUp, Package } from 'lucide-react';

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setSupplier({
        id: parseInt(id),
        code: 'SUP001',
        name: 'Green Farms Ltd',
        category: 'Raw Materials',
        country: 'Brazil',
        rating: 4.8,
        status: 'active',
        contactEmail: 'contact@greenfarms.com',
        contactPhone: '+55 11 9876-5432',
        address: 'Rua das Palmeiras, 123, São Paulo, Brazil',
        paymentTerms: 'Net 30',
        leadTimeDays: 14,
        totalOrders: 156,
        totalValue: 2450000,
        onTimeDeliveryRate: 94.5,
        qualityScore: 4.7,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  const breadcrumbs = [
    { label: 'Suppliers', href: '/procurement/suppliers' },
    { label: supplier.name },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                    <p className="text-gray-500">{supplier.code} • {supplier.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="font-semibold">{supplier.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} />
                  <span>{supplier.contactEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} />
                  <span>{supplier.contactPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 col-span-2">
                  <MapPin size={18} />
                  <span>{supplier.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-green-600">{supplier.onTimeDeliveryRate}%</div>
                  <div className="text-sm text-gray-600">On-time Delivery</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Package className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-blue-600">{supplier.totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="mx-auto text-purple-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-purple-600">{supplier.qualityScore}</div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Terms & Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payment Terms</dt>
                  <dd className="font-medium">{supplier.paymentTerms}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lead Time</dt>
                  <dd className="font-medium">{supplier.leadTimeDays} days</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Country</dt>
                  <dd className="font-medium">{supplier.country}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium capitalize">{supplier.status}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Total Spend</h3>
              <div className="text-3xl font-bold text-gray-900">
                ${supplier.totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
