import { useState } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Package } from 'lucide-react';

export default function ShipmentTracker({ shipmentId }) {
  const [tracking] = useState({
    id: shipmentId || 'SHP-2024-001',
    carrier: 'FastShip Logistics',
    trackingNumber: 'FS1234567890',
    estimatedDelivery: '2024-01-25',
    status: 'in_transit',
    events: [
      { date: '2024-01-22 09:00', location: 'Distribution Center', description: 'Package received', completed: true },
      { date: '2024-01-22 18:00', location: 'Regional Hub', description: 'In transit', completed: true },
      { date: '2024-01-23 08:00', location: 'Local Facility', description: 'Out for delivery', completed: false },
      { date: 'Expected by end of day', location: 'Destination', description: 'Delivered', completed: false },
    ],
  });

  const currentStep = tracking.events.findIndex(e => !e.completed);
  const totalSteps = tracking.events.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Truck size={20} />
            Shipment Tracking
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {tracking.carrier} • {tracking.trackingNumber}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Estimated Delivery</div>
          <div className="font-semibold">{tracking.estimatedDelivery}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Processing</span>
          <span>In Transit</span>
          <span>Out for Delivery</span>
          <span>Delivered</span>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-gray-200 rounded-full" />
          </div>
          <div className="relative flex justify-between">
            {tracking.events.map((event, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                  ${index < currentStep ? 'bg-green-500' : index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                {index < currentStep && <CheckCircle size={14} className="text-white" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {tracking.events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className={`mt-1 ${event.completed ? 'text-green-600' : index === currentStep ? 'text-blue-600' : 'text-gray-300'}`}>
              {event.completed ? <CheckCircle size={18} /> : <Clock size={18} />}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${event.completed ? 'text-gray-900' : index === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                {event.description}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <MapPin size={12} />
                <span>{event.location}</span>
                <span>•</span>
                <span>{event.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2">
          <Package size={16} />
          View Shipping Label
        </button>
      </div>
    </div>
  );
}
