import { Calendar, AlertCircle } from 'lucide-react';

const ExpiryTimelineChart = () => {
  // Mock data - will be replaced with API data
  const expiryData = [
    { period: 'This Week', count: 3, critical: true },
    { period: 'Next Week', count: 5, critical: false },
    { period: 'This Month', count: 12, critical: false },
    { period: 'Next Month', count: 8, critical: false },
  ];

  const maxCount = Math.max(...expiryData.map(d => d.count));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Expiry Timeline
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {expiryData.reduce((sum, item) => sum + item.count, 0)} Batches
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {expiryData.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.period}</span>
                <div className="flex items-center">
                  {item.critical && (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-semibold ${
                    item.critical ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {item.count}
                  </span>
                </div>
              </div>
              
              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    item.critical 
                      ? 'bg-gradient-to-r from-red-400 to-red-500' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}
                  style={{ 
                    width: `${(item.count / maxCount) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-600">Critical</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-600">Normal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <a href="/quality/batches?filter=expiring" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all expiring batches →
        </a>
      </div>
    </div>
  );
};

export default ExpiryTimelineChart;
