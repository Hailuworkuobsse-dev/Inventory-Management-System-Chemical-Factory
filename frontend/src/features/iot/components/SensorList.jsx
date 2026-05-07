import React, { useState } from 'react';
import { Wifi, WifiOff, Battery, Thermometer, Droplets, Activity, Search, Filter } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const SensorList = ({ sensors = [], onSelectSensor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || sensor.type === filterType;
    const matchesStatus = filterStatus === 'all' || sensor.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'multi': return Activity;
      default: return Wifi;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      multi: 'Multi-sensor',
      door: 'Door Contact',
      motion: 'Motion',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">IoT Sensors</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>{sensors.filter(s => s.status === 'online').length} / {sensors.length} Online</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search sensors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="multi">Multi-sensor</option>
            <option value="door">Door Contact</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredSensors.length === 0 ? (
          <div className="p-12 text-center">
            <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sensors found</p>
          </div>
        ) : (
          filteredSensors.map((sensor) => {
            const Icon = getSensorIcon(sensor.type);
            return (
              <div
                key={sensor.id}
                onClick={() => onSelectSensor?.(sensor)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sensor.status === 'online' ? 'bg-green-50' :
                    sensor.status === 'offline' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      sensor.status === 'online' ? 'text-green-600' :
                      sensor.status === 'offline' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{sensor.name}</h4>
                      <StatusBadge status={sensor.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-500">{sensor.id} • {getTypeLabel(sensor.type)}</p>
                    <p className="text-xs text-gray-400">Zone: {sensor.zone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {sensor.battery !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-600" title={`Battery: ${sensor.battery}%`}>
                      <Battery className={`w-4 h-4 ${
                        sensor.battery > 50 ? 'text-green-500' :
                        sensor.battery > 20 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span>{sensor.battery}%</span>
                    </div>
                  )}
                  {sensor.lastReading && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {sensor.lastReading.value}{sensor.lastReading.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sensor.lastReading.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SensorList;
