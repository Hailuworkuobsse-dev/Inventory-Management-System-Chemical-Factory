import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';

const ExcursionAlertList = ({ alerts = [], onAcknowledge, onResolve }) => {
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'acknowledged') return alert.status === 'acknowledged';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Excursion Alerts</h3>
              <p className="text-sm text-gray-500">
                {alerts.filter(a => a.status === 'active').length} active alerts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                  filter === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedAlert?.id === alert.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <StatusBadge status={alert.status} size="sm" />
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div>Sensor: {alert.sensorId}</div>
                      <div>Zone: {alert.zone}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.status === 'active' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledge?.(alert.id);
                      }}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {(alert.status === 'acknowledged' || alert.status === 'active') && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve?.(alert.id);
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExcursionAlertList;
