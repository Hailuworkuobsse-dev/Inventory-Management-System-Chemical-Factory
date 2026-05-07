import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const StockValueCard = ({ title, value, change, trend = 'up', alert = false }) => {
  const isUp = trend === 'up';
  
  return (
    <div className={`bg-white overflow-hidden rounded-lg shadow ${alert ? 'border-2 border-red-300' : ''}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${alert ? 'bg-red-100' : 'bg-blue-100'}`}>
            <DollarSign className={`h-6 w-6 ${alert ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Change</span>
            <div className={`flex items-center font-medium ${
              isUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {isUp ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {change}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockValueCard;
