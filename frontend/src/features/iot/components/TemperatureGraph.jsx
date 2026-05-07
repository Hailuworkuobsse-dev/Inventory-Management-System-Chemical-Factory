import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

const TemperatureGraph = ({ sensorId, data = [] }) => {
  const [timeRange, setTimeRange] = useState('24h');
  
  // Mock data generation if no data provided
  const chartData = data.length > 0 ? data : generateMockData();

  function generateMockData() {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now.getTime() - (23 - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: +(20 + Math.random() * 10 - 5).toFixed(1),
      minThreshold: 18,
      maxThreshold: 25,
    }));
  }

  const excursions = chartData.filter(d => d.temperature < d.minThreshold || d.temperature > d.maxThreshold);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Thermometer className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Temperature Monitoring</h3>
            <p className="text-sm text-gray-500">Sensor: {sensorId || 'SENS-001'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} unit="°C" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" label="Max" />
            <ReferenceLine y={18} stroke="#ef4444" strokeDasharray="3 3" label="Min" />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Normal: {chartData.length - excursions.length} readings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">
              Excursions: {excursions.length}
            </span>
          </div>
        </div>
        <StatusBadge status={excursions.length > 0 ? 'critical' : 'normal'} />
      </div>
    </div>
  );
};

export default TemperatureGraph;
