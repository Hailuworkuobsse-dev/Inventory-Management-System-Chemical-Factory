import { Star, TrendingUp, Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SupplierScorecard({ supplier }) {
  const metrics = supplier?.metrics || {
    onTimeDelivery: 94.5,
    qualityScore: 4.7,
    orderFulfillment: 98.2,
    responseTime: 2.3,
    defectRate: 1.2,
    totalOrders: 156,
  };

  const getRatingColor = (score) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Supplier Scorecard</h3>
        <div className={`flex items-center gap-2 ${getRatingColor(metrics.qualityScore)}`}>
          <Star className="fill-current" size={20} />
          <span className="text-xl font-bold">{metrics.qualityScore}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* On-Time Delivery */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span>On-Time Delivery</span>
            </div>
            <span className="font-semibold">{metrics.onTimeDelivery}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(metrics.onTimeDelivery)}`}
              style={{ width: `${metrics.onTimeDelivery}%` }}
            />
          </div>
        </div>

        {/* Order Fulfillment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Package size={18} />
              <span>Order Fulfillment</span>
            </div>
            <span className="font-semibold">{metrics.orderFulfillment}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(metrics.orderFulfillment)}`}
              style={{ width: `${metrics.orderFulfillment}%` }}
            />
          </div>
        </div>

        {/* Response Time */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp size={18} />
              <span>Avg Response Time</span>
            </div>
            <span className="font-semibold">{metrics.responseTime} hrs</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(100 - metrics.responseTime * 10)}`}
              style={{ width: `${100 - metrics.responseTime * 10}%` }}
            />
          </div>
        </div>

        {/* Defect Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle size={18} />
              <span>Defect Rate</span>
            </div>
            <span className="font-semibold">{metrics.defectRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(100 - metrics.defectRate * 10)}`}
              style={{ width: `${100 - metrics.defectRate * 10}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={18} />
            <span>Total Orders Completed</span>
          </div>
          <span className="font-bold text-lg">{metrics.totalOrders}</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Recommendation:</strong>{' '}
          {metrics.qualityScore >= 4.5 
            ? 'Preferred supplier - maintain current relationship'
            : metrics.qualityScore >= 3.5
            ? 'Monitor performance - consider improvement plan'
            : 'Review supplier - consider alternatives'}
        </p>
      </div>
    </div>
  );
}
