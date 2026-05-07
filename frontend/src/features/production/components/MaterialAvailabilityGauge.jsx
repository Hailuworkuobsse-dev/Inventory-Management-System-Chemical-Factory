import { Gauge } from 'lucide-react';

export default function MaterialAvailabilityGauge({ materials }) {
  const availability = materials.map(m => ({
    name: m.name,
    percentage: Math.min(100, (m.consumed / m.required) * 100),
    status: m.consumed >= m.required ? 'sufficient' : m.consumed >= m.required * 0.5 ? 'low' : 'critical',
  }));

  const getColor = (status) => {
    if (status === 'sufficient') return 'text-green-600';
    if (status === 'low') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (status) => {
    if (status === 'sufficient') return 'bg-green-500';
    if (status === 'low') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const avgAvailability = availability.reduce((sum, m) => sum + m.percentage, 0) / availability.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Gauge size={20} />
        Material Availability
      </h3>

      {/* Overall Gauge */}
      <div className="mb-6 text-center">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="16" fill="none" />
            <circle
              cx="64" cy="64" r="56"
              stroke={avgAvailability >= 80 ? '#22c55e' : avgAvailability >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="16" fill="none"
              strokeDasharray={`${(avgAvailability / 100) * 352} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-bold">{avgAvailability.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
        </div>
      </div>

      {/* Individual Materials */}
      <div className="space-y-3">
        {availability.map((mat, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="truncate">{mat.name}</span>
              <span className={`font-medium ${getColor(mat.status)}`}>{mat.percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${getBgColor(mat.status)}`} style={{ width: `${mat.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex gap-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" />Sufficient</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" />Low</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" />Critical</div>
      </div>
    </div>
  );
}
