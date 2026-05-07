import React from 'react';
import { LayoutDashboard, Thermometer, AlertTriangle, Wifi } from 'lucide-react';
import TemperatureGraph from './components/TemperatureGraph';
import ExcursionAlertList from './components/ExcursionAlertList';
import SensorList from './components/SensorList';
import StockGauge from '../../components/StockGauge';
import StatusBadge from '../../components/StatusBadge';

const IotDashboardPage = () => {
  // Mock data - would come from API in real app
  const mockSensors = [
    { id: 'SENS-001', name: 'Cold Room A', type: 'temperature', status: 'online', zone: 'Zone A', battery: 85, lastReading: { value: 4.2, unit: '°C', timestamp: new Date() } },
    { id: 'SENS-002', name: 'Cold Room B', type: 'temperature', status: 'online', zone: 'Zone B', battery: 72, lastReading: { value: 3.8, unit: '°C', timestamp: new Date() } },
    { id: 'SENS-003', name: 'Freezer Unit 1', type: 'temperature', status: 'offline', zone: 'Zone C', battery: 15, lastReading: { value: -18.5, unit: '°C', timestamp: new Date(Date.now() - 3600000) } },
    { id: 'SENS-004', name: 'Warehouse Main', type: 'multi', status: 'online', zone: 'Zone D', battery: 92, lastReading: { value: 22.1, unit: '°C', timestamp: new Date() } },
  ];

  const mockAlerts = [
    { id: 1, title: 'Temperature Excursion - Cold Room A', description: 'Temperature exceeded maximum threshold (8.5°C > 5°C)', severity: 'critical', status: 'active', sensorId: 'SENS-001', zone: 'Zone A', timestamp: new Date() },
    { id: 2, title: 'Sensor Offline - Freezer Unit 1', description: 'No data received for over 1 hour', severity: 'high', status: 'acknowledged', sensorId: 'SENS-003', zone: 'Zone C', timestamp: new Date(Date.now() - 3600000) },
    { id: 3, title: 'Low Battery Warning', description: 'Sensor battery below 20%', severity: 'medium', status: 'active', sensorId: 'SENS-003', zone: 'Zone C', timestamp: new Date(Date.now() - 7200000) },
  ];

  const handleAcknowledgeAlert = (alertId) => {
    console.log('Acknowledging alert:', alertId);
  };

  const handleResolveAlert = (alertId) => {
    console.log('Resolving alert:', alertId);
  };

  const handleSelectSensor = (sensor) => {
    console.log('Selected sensor:', sensor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor sensors, temperature, and environmental conditions</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="operational" />
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sensors</p>
              <p className="text-2xl font-bold text-gray-900">{mockSensors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Online</p>
              <p className="text-2xl font-bold text-gray-900">{mockSensors.filter(s => s.status === 'online').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{mockAlerts.filter(a => a.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Thermometer className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-900">4.5°C</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Graph */}
        <TemperatureGraph sensorId="SENS-001" />
        
        {/* Alert List */}
        <ExcursionAlertList
          alerts={mockAlerts}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
        />
      </div>

      {/* Sensor List */}
      <SensorList
        sensors={mockSensors}
        onSelectSensor={handleSelectSensor}
      />
    </div>
  );
};

export default IotDashboardPage;
