import { TrendingUp, Target } from 'lucide-react';

export default function YieldChart({ target, actual }) {
  const yieldPercentage = (actual / target) * 100;
  const variance = actual - target;
  const variancePercent = (variance / target) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Production Yield
      </h3>

      {/* Main Yield Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{yieldPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Yield Rate</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
            <Target size={14} />
            Target
          </div>
          <div className="text-xl font-bold">{target}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-gray-500 text-sm mb-1">Actual</div>
          <div className={`text-xl font-bold ${actual >= target ? 'text-green-600' : 'text-yellow-600'}`}>
            {actual}
          </div>
        </div>
      </div>

      {/* Variance */}
      <div className={`p-4 rounded-lg ${variance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Variance</span>
          <span className={`font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {variance >= 0 ? '+' : ''}{variance} ({variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${
              yieldPercentage >= 100 ? 'bg-green-500' : yieldPercentage >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(100, yieldPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
